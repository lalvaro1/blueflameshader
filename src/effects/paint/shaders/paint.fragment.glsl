const paint_fragmentShader = `

precision highp float;

out vec4 fragColor;

varying float v_particleTime;
varying float v_particleFrame;
varying vec3 v_position;
varying vec3 v_color;

uniform float iTime;

vec2 hash(vec2 p) {
	p = vec2( dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)) );
	return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}

float noise(in vec2 p) {
    const float K1 = 0.366025404; // (sqrt(3)-1)/2;
    const float K2 = 0.211324865; // (3-sqrt(3))/6;

	vec2  i = floor( p + (p.x+p.y)*K1 );
    vec2  a = p - i + (i.x+i.y)*K2;
    float m = step(a.y,a.x); 
    vec2  o = vec2(m,1.0-m);
    vec2  b = a - o + K2;
	vec2  c = a - 1.0 + 2.0*K2;
    vec3  h = max( 0.5-vec3(dot(a,a), dot(b,b), dot(c,c) ), 0.0 );
	vec3  n = h*h*h*h*vec3( dot(a,hash(i+0.0)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
    return min(1., dot( n, vec3(70.0) ) + 0.2);
}

float fbm(vec2 pos, int n) {
    float total = 0.;
    float frequency = 1.;
    float amplitude = 1.;
    
    for(int i = 1; i <= n; i+=2) {
        total += noise(pos * frequency) * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
        total += noise(pos.yx * frequency) * amplitude;
        amplitude *= 0.5;
        frequency *= 2.0;
    }

    return total;
}


float radialNoise(float theta, float index) {

    float kMax;
    float radius = 0.; 
    float inter = 0.05; 
    float maxNoise = 500.; 

    float n = 100.;

    float size = radius + index * inter;
    float k = kMax * sqrt(index/n);
    float noisiness = maxNoise * (index / n);

    size = 0.25;

	float r1 = cos(theta);
	float r2 = sin(theta); 

    return noise(vec2(k*r1, k*r2));
}


void main() {

    float particleTime = v_particleTime;

    float ageAttenuation = max(0., 1.- particleTime*0.25);

    float angle = atan(v_position.y, v_position.x);

    float x = cos(angle + iTime*0.25) + cos(angle * -2. - iTime*0.5);
    float y = sin(angle - iTime*0.25);    

    float test = noise(vec2(x, y));

    float r = 0.25 + test * 0.025; 


//    if(length(v_position) < r) fragColor = vec4(1,0,0,0.25);
//    else fragColor = vec4(0,0,0,0);



    float fade = max(0., 1. - particleTime*0.025);
    float radius = max(0.001, r - particleTime*0.00025);
    float l = length(v_position);

    float shapeAlpha = smoothstep(0., 0.5, 1. - l/radius);

    float hash = v_particleFrame;
    float noise = min(fbm(v_position.xy * 0.5 + hash * 10.0, 8), 1.);

    float smoke = shapeAlpha * noise;

    fragColor = vec4(v_color * 0.5 * shapeAlpha, fade);

    float grain = (fract(sin(dot(v_position.xy, vec2(12.9898,78.233)*2.0)) * 43758.5453)) * 0.0075;
    
    fragColor.xyz -= grain;



    // fragColor = vec4(vec3(1) * shapeAlpha, fade);
}

`;
