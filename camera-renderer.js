/* ==========================================================================
   GPU landmark morph: geometry moves first, then the aligned textures blend.
   Exposes window.createDeskCamera(canvas) -> { render(progress), resize() }
   ========================================================================== */
(function () {
  // WebP keeps the three desk frames at ~110 KB each instead of ~1.9 MB.
  const webp = (() => {
    try {
      return document.createElement('canvas').toDataURL('image/webp').startsWith('data:image/webp');
    } catch (_) {
      return false;
    }
  })();
  const SOURCES = [
    ['desk-overhead', 'desk-overhead-v3.png'],
    ['desk-mid', 'desk-mid-v3.png'],
    ['desk-front', 'desk-front-v5.png'],
  ].map(([stem, png]) => (webp ? `assets/${stem}.webp` : png));

  window.createDeskCamera = async function (canvas) {
    const gl =
      canvas.getContext('webgl', { alpha: false, antialias: true, powerPreference: 'low-power' }) ||
      canvas.getContext('experimental-webgl', { alpha: false, antialias: true });
    if (!gl) throw new Error('WebGL unavailable');

    const source = [
      'precision mediump float; attribute vec2 a; attribute vec2 b; uniform float t; varying vec2 ua; varying vec2 ub; void main(){ua=a;ub=b;vec2 p=mix(a,b,t);gl_Position=vec4(p.x*2.0-1.0,1.0-p.y*2.0,0.0,1.0);}',
      'precision mediump float; uniform sampler2D one; uniform sampler2D two; uniform float t; varying vec2 ua; varying vec2 ub; void main(){float blend=smoothstep(0.34,0.66,t);gl_FragColor=mix(texture2D(one,ua),texture2D(two,ub),blend);}',
    ];
    const program = gl.createProgram();
    source.forEach((text, i) => {
      const shader = gl.createShader(i ? gl.FRAGMENT_SHADER : gl.VERTEX_SHADER);
      gl.shaderSource(shader, text);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
        throw new Error(gl.getShaderInfoLog(shader));
      gl.attachShader(program, shader);
    });
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS))
      throw new Error(gl.getProgramInfoLog(program));
    gl.useProgram(program);

    const images = await Promise.all(
      SOURCES.map(
        (src) =>
          new Promise((resolve, reject) => {
            const img = new Image();
            img.decoding = 'async';
            img.onload = () => resolve(img);
            img.onerror = () => reject(new Error('Image missing: ' + src));
            img.src = src;
          }),
      ),
    );

    const maxTexture = gl.getParameter(gl.MAX_TEXTURE_SIZE);
    const textures = images.map((img) => {
      let source = img;
      if (img.width > maxTexture || img.height > maxTexture) {
        const shrink = maxTexture / Math.max(img.width, img.height);
        const copy = document.createElement('canvas');
        copy.width = Math.round(img.width * shrink);
        copy.height = Math.round(img.height * shrink);
        copy.getContext('2d').drawImage(img, 0, 0, copy.width, copy.height);
        source = copy;
      }
      const texture = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);
      return texture;
    });

    const data = DeskMesh;
    const vertices = data.triangles.flat();
    const buffers = [0, 1, 2].map((field) => {
      const buffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(
        gl.ARRAY_BUFFER,
        new Float32Array(
          vertices.flatMap((index) => [
            data.points[index][field][0] / 1672,
            data.points[index][field][1] / 941,
          ]),
        ),
        gl.STATIC_DRAW,
      );
      return buffer;
    });

    const a = gl.getAttribLocation(program, 'a');
    const b = gl.getAttribLocation(program, 'b');
    const time = gl.getUniformLocation(program, 't');
    gl.uniform1i(gl.getUniformLocation(program, 'one'), 0);
    gl.uniform1i(gl.getUniformLocation(program, 'two'), 1);
    gl.enableVertexAttribArray(a);
    gl.enableVertexAttribArray(b);

    // Render at the size the canvas is actually displayed at (capped at 2x) so the
    // morph stays crisp on high-density screens without overspending on fill rate.
    function resize() {
      const ratio = Math.min(2, window.devicePixelRatio || 1);
      const width = Math.max(1, Math.round((canvas.clientWidth || 1672) * ratio));
      const height = Math.max(1, Math.round((canvas.clientHeight || 941) * ratio));
      if (canvas.width !== width || canvas.height !== height) {
        canvas.width = width;
        canvas.height = height;
      }
      gl.viewport(0, 0, canvas.width, canvas.height);
    }
    resize();

    let lastSegment = -1;
    return {
      resize,
      render(progress) {
        const sequence = Math.min(2, Math.max(0, progress * 2));
        const segment = Math.min(1, Math.floor(sequence));
        const t = sequence - segment;
        if (segment !== lastSegment) gl.useProgram(program);
        lastSegment = segment;
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[segment]);
        gl.vertexAttribPointer(a, 2, gl.FLOAT, false, 0, 0);
        gl.bindBuffer(gl.ARRAY_BUFFER, buffers[segment + 1]);
        gl.vertexAttribPointer(b, 2, gl.FLOAT, false, 0, 0);
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, textures[segment]);
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D, textures[segment + 1]);
        gl.uniform1f(time, t);
        gl.drawArrays(gl.TRIANGLES, 0, vertices.length);
        lastSegment = segment;
      },
    };
  };
})();
