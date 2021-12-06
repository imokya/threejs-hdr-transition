uniform sampler2D uTexture1;
uniform sampler2D uTexture2;
uniform float uProgress;
varying vec2 vUv;

vec2 distort(vec2 uv, float progress, float expo) {
  vec2 p0 = 2.0 * uv - 1.0;
  vec2 p1 = p0/(1.0 - progress*length(p0)*expo);
  return (p1 + 1.0) * 0.5;
}

void main() {
  float progress1 = smoothstep(0.75, 1.0, uProgress);

  vec2 uv1 = distort(vUv, -10.0*pow(0.5+0.5*uProgress, 16.0), uProgress*4.0);
  vec2 uv2 = distort(vUv, -10.0*(1.0-progress1), uProgress*4.0);

  vec4 tex1 = texture2D(uTexture1, uv1);
  vec4 tex2 = texture2D(uTexture2, uv2);
  
  vec4 finalTexture = mix(tex1, tex2, progress1);
  gl_FragColor = finalTexture;
}