#ifdef GL_ES
precision mediump float;
#endif

#extension GL_OES_standard_derivatives : enable

uniform float u_time;
uniform vec2 u_resolution;

void main( void ) {

	float PI = 3.1415;
	
	vec2 uv = vec2( gl_FragCoord.x / u_resolution.x, gl_FragCoord.y / u_resolution.x );

	vec2 mid = vec2(0.5, u_resolution.y / u_resolution.x + .26);
	
	float dist = distance(uv, mid);
	float sunValue = clamp(1./dist/10., 0., 1.);
	float angle = atan(uv.y - mid.y, uv.x -mid.x);
	float darken = 0.7 * 1. / dist * clamp(sin(angle /10.) * sin((angle + u_time / 6.)*30.)+0.5, 0., 1.);
	
	float v = sunValue * darken;
	
	gl_FragColor = vec4(v,v*dist,0,1);
}