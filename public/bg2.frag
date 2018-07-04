#ifdef GL_ES
precision lowp float;
#endif

uniform float u_time;
uniform vec2 u_resolution;

float Hash( vec2 p) {
  vec3 p2 = vec3(p.xy,1.0);
  return fract(sin(dot(p2,vec3(37.1,61.7, 12.4)))*758.5453123);
}

float noise(in vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f *= f * (3.0-2.0*f);

  return mix(mix(Hash(i + vec2(0.,0.)), Hash(i + vec2(1.,0.)),f.x),
             mix(Hash(i + vec2(0.,1.)), Hash(i + vec2(1.,1.)),f.x),
             f.y);
}

float fbm(vec2 p) {
   float v = 0.0;
   v += noise(p*1.)*.100;
   v += noise(p*2.)*.25;
   v += noise(p*4.)*.125;
   v += noise(p*8.)*.0625;
   return v;
}

void main( void ) {
  vec2 uv = ( gl_FragCoord.xy / u_resolution.xy ) * 2.0 - 1.0;
  uv.x *= u_resolution.x/u_resolution.y;

  vec3 finalColor = vec3( 0.0 );
  for( int i=1; i < 8; ++i ) {
      float t = abs(1.0 / ((uv.y + fbm( uv + u_time/float(i)))*75.));
      finalColor +=  t * vec3( float(i) * 0.1 +0.1, 0.5, 2.0 );
  }
	gl_FragColor = vec4( finalColor, 1.0 );
}