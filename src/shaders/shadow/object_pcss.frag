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
#define LIGHT_SIZE 50.0
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


float filterPCSS(vec4 shadingPoint_Pos_LightSpace, float ShadowMapBias)
{
    vec2 texelSize = 1.0 / textureSize(shadowMap, 0);

    if ( shadingPoint_Pos_LightSpace.z < 0.0 && shadingPoint_Pos_LightSpace.z > 1.0 ) {
        return 0.0;
    }
	//Step 1: Blocker search: getting the average blocker depth in a certain region(计算遮挡物和阴影接受物的平均距离)

	//The size of the search region depends on the light size and the receiver’s distance from the light source.
	float sumAverageBlockerDistances = 0.001f;
    int sumBlockerNum = 0;
	float dReceiver = shadingPoint_Pos_LightSpace.z;
    float searchRange = 40;
{
//    int window = 3;
//    for( int i = -window; i < window; ++i ){
//        for( int j = -window; j < window; ++j ){
//            vec2 offset = vec2(i * 1.0 * searchRange / window, j * 1.0 * searchRange / window) * texelSize;
//
//            float shadowMapDepth = texture(shadowMap, shadingPoint_Pos_LightSpace.xy + offset ).r;
//            
//            if (shadowMapDepth < dReceiver -  ShadowMapBias){
//                sumAverageBlockerDistances += shadowMapDepth;
//                sumBlockerNum++;
//            }
//        }
//    }
}
{

//for (int i = 0; i < SAMPLES; ++i){
//
//        vec2 offset = POISSON32[i] * searchRange * texelSize;
//        float shadowMapDepth = texture(shadowMap, shadingPoint_Pos_LightSpace.xy + offset).r;
//
//        if(shadowMapDepth < dReceiver ){        //如果要渲染的片源被挡住，就记录被挡住block高度
//            sumAverageBlockerDistances += shadowMapDepth;
//            sumBlockerNum++;
//        }
//	 }
//
//    if(sumBlockerNum > 0){
//       sumAverageBlockerDistances = sumAverageBlockerDistances / sumBlockerNum;
//    }
//    else{
//        return 0;
//    }

}
    sumAverageBlockerDistances = findBlocker(shadowMap, shadingPoint_Pos_LightSpace.xy, shadingPoint_Pos_LightSpace.z);

	//Step 2: Penumbra estimation: use the average blocker depth to determine filter size
    float penumbraWidth = LIGHT_SIZE * max(dReceiver - sumAverageBlockerDistances, 0.0) / sumAverageBlockerDistances;
    
 
    return PCF(shadowMap, shadingPoint_Pos_LightSpace, penumbraWidth);

	//Step 3: Filtering
    float shadow = 0.0;
    int count = 0;
//    int range = clamp(int(penumbraWidth / 0.02), 1, 30);
//    return range;
//
//     for(int x = -range; x <= range; ++x)
//    {
//        for(int y = -range; y <= range; ++y)
//        {
//            float pcfDepth = texture(shadowMap, shadingPoint_Pos_LightSpace.xy + vec2(x, y) * texelSize).r;
//            shadow += dReceiver > pcfDepth  ? 1.0 : 0.0;
//            count++;
//        }
//    }
//
    return shadow;

   

   
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


    float shadow = filterPCSS(inShadowCoord_n, ShadowMapBias) ;

	outFragColor = vec4((specular + diffuse) * (1.0 - shadow) + vec3(0.15) * inColor, 1.0);
    //outFragColor = vec4(vec3(shadow)/30.0 , 1.0);
}
