///////////////////
// Collide Layer
///////////////////
const collide_fragmentShader = common_fragmentShader + ` 

uniform vec3 iResolution;
uniform float iTime;
uniform int iFrame;
uniform vec4 iMouse;
uniform sampler2D layer1;

out vec4 fragColor;

float equilibrium(float w, float rho, vec2 u, vec2 c, float cs) {
    float c_dot_u = dot(c, u);
    float u_dot_u = dot(u, u);    
    
    float eq = w*rho*(1. + c_dot_u/(cs*cs) + (c_dot_u*c_dot_u)/(2.*cs*cs*cs*cs) - u_dot_u/(2.*cs*cs) );

    return eq ;//* 0.999;
}

float getMass(Cell cell) {

    float mass = 0.;

    for(int c=0; c<9; c++) {
        mass += cell.velocities[c];
    }

    return mass;
}

float getDensity(vec2 source, vec2 uv, float intensity, float radius) {
   float dist = length(source-uv)/iResolution.x;
   return max(0., intensity*(1. - dist/radius));
}

void mainImage(out vec4 fragColor, in vec2 fragCoord) {

    ivec2 cellCoords = ivec2(fragCoord);
    
    int width  = int(iResolution.x);
    int height = int(iResolution.y);
    
    bool border = (cellCoords.x==0) || (cellCoords.y==0) || (cellCoords.x >= width-1) || (cellCoords.y >= height-1);
    
    if(iFrame == 0) {

        Cell c;

        float density = border ? 0. : 00.;

        for(int i=0;i<9;i++) {
            c.velocities[i] = density * weight[i];
        }
        
        fragColor = pack(c);
    }
    else {

        // flow
        //vec2 flow = (iMouse.xy - iResolution.xy*0.5)/iResolution.xy;
        //ivec2 flowVelocity = ivec2(flow*10.);
        ivec2 flowVelocity = ivec2(0,2);

        Cell cell = unpack(texelFetch(layer1, cellCoords + flowVelocity, 0));

        // sources
        float synchro = float(iFrame) * 1./60.; 
        vec2 source1 = vec2(iResolution.x/2. * (1. + cos(synchro)*0.5), iResolution.y/2. * (1. + sin(2.*synchro)*0.5));
        vec2 source2 = vec2(iResolution.x/2. * (1. - cos(synchro)*0.5), iResolution.y/2. * (1. - sin(1.*synchro)*0.5));        

        float density = getDensity(source1, fragCoord, 400., 0.05) + getDensity(source2, fragCoord, 400., 0.05);
        if(iMouse.z>0.) density += getDensity(iMouse.xy, fragCoord, 150., 0.025);
        

        // collisions
        vec2 momentum = vec2(0.);

        float mass = getMass(cell);

        if(mass != 0.) {    
            for(int c=1; c<9; c++) {
                momentum += velocities[c] * cell.velocities[c];
            }

            momentum *= 1./mass;
        }

        //equilibrium    
        float tau = 2.;

        for(int i=0; i<9; i++) {

            float w = weight[i];
            float rho = mass;
            vec2 u = momentum;
            vec2 c = velocities[i];
            float cs = 1./1.73;    

            float eq = equilibrium(w, rho, u, c, cs);

            cell.velocities[i] = cell.velocities[i] - (1./tau)*(cell.velocities[i] - eq);
            
            cell.velocities[i] = max(8., cell.velocities[i]);
            cell.velocities[i] = min(480., cell.velocities[i]);            
            
        }                

        for(int i=0; i<9; i++) cell.velocities[i] += density*weight[i];


        fragColor = pack(cell);
    }
}

void main() {
    mainImage(fragColor, gl_FragCoord.xy);
}

`;