#version 450

layout (binding = 1) uniform sampler2D shadowMap;

layout (location = 0) in vec3 inNormal;
layout (location = 1) in vec3 inColor;
layout (location = 2) in vec3 inViewVec;
layout (location = 3) in vec3 inLightVec;
layout (location = 4) in vec4 inShadowCoord;

layout (constant_id = 0) const int enablePCF = 0;

layout (location = 0) out vec4 outFragColor;

#define ambient 0.1
#define SAMPLES 32
#define LIGHT_SIZE 129.0
#define NEAR 0.05

const vec2 POISSON32[32] = vec2[](
    vec2(-0.975402, -0.0711386),
    vec2(-0.920347, -0.41142),
    vec2(-0.883908, 0.217872),
    vec2(-0.884518, 0.568041),
    vec2(-0.811945, 0.90521),
    vec2(-0.792474, -0.779962),
    vec2(-0.614856, 0.386578),
    vec2(-0.580859, -0.208777),
    vec2(-0.53795, 0.716666),
    vec2(-0.515427, 0.0899991),
    vec2(-0.454634, -0.707938),
    vec2(-0.420942, 0.991272),
    vec2(-0.261147, 0.588488),
    vec2(-0.211219, 0.114841),
    vec2(-0.146336, -0.259194),
    vec2(-0.139439, -0.888668),
    vec2(0.0116886, 0.326395),
    vec2(0.0380566, 0.625477),
    vec2(0.0625935, -0.50853),
    vec2(0.125584, 0.0469069),
    vec2(0.169469, -0.997253),
    vec2(0.320597, 0.291055),
    vec2(0.359172, -0.633717),
    vec2(0.435713, -0.250832),
    vec2(0.507797, -0.916562),
    vec2(0.545763, 0.730216),
    vec2(0.56859, 0.11655),
    vec2(0.743156, -0.505173),
    vec2(0.736442, -0.189734),
    vec2(0.843562, 0.357036),
    vec2(0.865413, 0.763726),
    vec2(0.872005, -0.927));


float findBlocker( sampler2D shadowMap,  vec2 uv, float zReceiver ) {
  const int radius = 40;
  const vec2 texelSize = vec2(1.0/2048.0, 1.0/2048.0);
  float cnt = 0.0, blockerDepth = 0.0;
  int flag = 0;
  for(int ns = 0;ns < SAMPLES;++ns)
  {
      vec2 sampleCoord = (vec2(radius) * POISSON32[ns]) * texelSize + uv;
      float cloestDepth = texture(shadowMap, sampleCoord).r;
      if(zReceiver - 0.002 > cloestDepth)
      {
        blockerDepth += cloestDepth;
        cnt += 1.0;
        flag = 1;
      }
  }
  if(flag == 1)
  {
	  return blockerDepth / cnt;
  }
  return 1.0;
}

float PCF(sampler2D shadowMap, vec4 shadowCoord, float radius) {
  const vec2 texelSize = vec2(1.0/2048.0, 1.0/2048.0);
  float visibility = 0.0, cnt = 0.0;
  for(int ns = 0;ns < SAMPLES;++ns)
  {
    vec2 sampleCoord = (vec2(radius) * POISSON32[ns]) * texelSize + shadowCoord.xy;
    float cloestDepth = texture(shadowMap, sampleCoord).r;
    visibility += ((shadowCoord.z - 0.001) > cloestDepth ? 0.0 : 1.0);
    cnt += 1.0;
  }
  return visibility/cnt;
}

float PCSS(sampler2D shadowMap, vec4 shadingPoint_Pos_LightSpace){

  // STEP 1: avgblocker depth
  float avgBlockerDepth = findBlocker(shadowMap, shadingPoint_Pos_LightSpace.xy, shadingPoint_Pos_LightSpace.z);


  // STEP 2: penumbra size
  const float lightWidth = 50.0;
  float penumbraSize = max(shadingPoint_Pos_LightSpace.z-avgBlockerDepth,0.0)/avgBlockerDepth * lightWidth;

  // STEP 3: filtering
  return PCF(shadowMap, shadingPoint_Pos_LightSpace, penumbraSize);
  //return 1.0;

}

void main() 
{	
    vec4 inShadowCoord_n = inShadowCoord /inShadowCoord.w;
	inShadowCoord_n.xy = inShadowCoord_n.xy * 0.5 + 0.5;

	vec3 N = (inNormal);
	vec3 L = (inLightVec);
	vec3 V = (inViewVec);
	vec3 H = normalize(L + V);

    float ShadowMapBias = max(0.05 * (1.0 - dot(N, L)), 0.001);

	vec3 diffuse = max(dot(N, L), ambient) * inColor;
	vec3 specular = max(pow(dot(H, N), 32), 0) * inColor * 0.15f;


    float shadow = PCSS(shadowMap, inShadowCoord_n) ;

	//outFragColor = vec4((specular + diffuse) * (shadow) + vec3(0.15) * inColor, 1.0);
    outFragColor = vec4(vec3(shadow)/ 4. , 1.0);
}
