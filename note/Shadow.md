<h1 align='center' >1. Prerequisite</h1>

### 1.1 Directional Shadow Mapping
**Step 1:**
All rays of a directional light source are parallel. Therefore, we will use the orthographic projection matrix for the light source

```c
//example code of lightSpaceMatrix calculation
float near_plane = 1.0f, far_plane = 7.5f;
glm::mat4 lightProjection = glm::ortho(-10.0f, 10.0f, -10.0f, 10.0f, near_plane, far_plane);  

glm::mat4 lightView = glm::lookAt(glm::vec3(-2.0f, 4.0f, -1.0f), 
                                  glm::vec3( 0.0f, 0.0f,  0.0f), 
                                  glm::vec3( 0.0f, 1.0f,  0.0f));  

glm::mat4 lightSpaceMatrix = lightProjection * lightView; 
```

**Step 2:**
Define the graphics pipeline (has only one stage)
```c
//example code of Shadow Mapping GraphicsPipelines: only have one stage
shaderStages[0] = loadShader(getShadersPath() + "shadow/compile/shadowmap_vert.spv", VK_SHADER_STAGE_VERTEX_BIT);
pipelineCI.stageCount = 1;
// No blend attachment states (no color attachments used)
colorBlendStateCI.attachmentCount = 0;
// Disable culling, so all faces contribute to shadows
rasterizationStateCI.cullMode = VK_CULL_MODE_NONE;
//VK_COMPARE_OP_LESS_OR_EQUAL specifies that the comparison evaluates Z_fragment ≤ Z_attachment, if pass(true), use this fragment rewrite color.
depthStencilStateCI.depthCompareOp = VK_COMPARE_OP_LESS_OR_EQUAL;
// Enable depth bias
rasterizationStateCI.depthBiasEnable = VK_TRUE;
```


**Step 3:**
Set Depth Bias

The depth bias depends on three parameters:
* **depthBiasSlopeFactor**: scales the maximum depth slope m of the polygon
* **depthBiasConstantFactor**: scales the parameter r of the depth attachment
* **depthBiasClamp**: the scaled terms are summed to produce a value which is then clamped to a minimum or maximum value specified by depthBiasClamp

**Step 4:**
Set Depth Texture Wrapping
<div align=center>
<img src="./pics/texture_wrapping.png" width="60%">
</div>
```c
VkSamplerCreateInfo sampler = vks::initializers::samplerCreateInfo();
sampler.magFilter = shadowmap_filter;
sampler.minFilter = shadowmap_filter;
sampler.mipmapMode = VK_SAMPLER_MIPMAP_MODE_LINEAR;
sampler.addressModeU = VK_SAMPLER_ADDRESS_MODE_CLAMP_TO_BORDER;
sampler.borderColor = VK_BORDER_COLOR_FLOAT_OPAQUE_WHITE;
sampler.addressModeV = sampler.addressModeU;
sampler.addressModeW = sampler.addressModeU;
sampler.mipLodBias = 0.0f;
sampler.maxAnisotropy = 1.0f;
sampler.minLod = 0.0f;
sampler.maxLod = 1.0f;
sampler.borderColor = VK_BORDER_COLOR_FLOAT_OPAQUE_WHITE;
```


**Step 4:**
Rendering shadow map in vertex stage
```glsl
//example code of Directional Shadow Mapping Vertex Shader(pass 1)
#version 330 core
layout (location = 0) in vec3 aPos;

uniform mat4 lightSpaceMatrix;
uniform mat4 model;

void main()
{
    gl_Position = lightSpaceMatrix * model * vec4(aPos, 1.0);
}  
```

**Step 5:**
Rendering shadow in next pass
```glsl
//example code of Directional Shadow Mapping Vertex Shader(pass 2)
layout (binding = 0) uniform UBO 
{
	mat4 projection;
	mat4 view;
	vec4 camPos;
	mat4 lightSpaceMatrix;
	vec4 lightPos;

} ubo;

layout(push_constant) uniform PushConsts {
	mat4 model;
}pushConsts;

layout (location = 0) out vec3 outNormal;
layout (location = 1) out vec3 outColor;
layout (location = 2) out vec3 outViewVec;
layout (location = 3) out vec3 outLightVec;
layout (location = 4) out vec4 outShadowCoord;

/* 
注意行列对应关系，按照列的先后顺序，从上到下依次传入mat构造函数参数中
需要表示的矩阵
1.1 1.2 1.3 1.4
2.1 2.2 2.3 2.4
3.1 3.2 3.3 3.4
4.1 4.2 4.3 4.4

mat4 matrix4 = mat4(
    1.1,2.1,3.1,4.1,
    1.2,2.2,3.2,4.2,
    1.3,2.3,3.3,4.3,
    1.4,2.4,3.4,4.4
);

// 访问矩阵matrix4的第二列
vec4 v4 = matrix4[1];//返回值vec4(1.2,2.2,3.2,4.2)
// 访问矩阵matrix4的第三列第四行对应的元素
float f = matrix4[2][3];//返回4.3
*/

const mat4 biasMat = mat4( 
	0.5, 0.0, 0.0, 0.0,
	0.0, 0.5, 0.0, 0.0,
	0.0, 0.0, 1.0, 0.0,
	0.5, 0.5, 0.0, 1.0 );

void main() 
{
    outColor = inColor;
    gl_Position = ubo.projection * ubo.view * pushConsts.model * vec4(inPos.xyz, 1.0);

    vec4 pos = pushConsts.model * vec4(inPos, 1.0);  //world space pos
    outNormal = normalize(mat3(pushConsts.model) * inNormal);   //world space normal

    outLightVec = normalize(ubo.lightPos.xyz - pos.xyz);
    outViewVec = normalize(ubo.camPos.xyz - pos.xyz);

    //texture sample is in the range [0,1], and outShadowCoord is in the range [-1, 1]
    //we need transform outShadowCoord by outShadowCoord.xy = outShadowCoord.xy * 0.5 + 0.5
    //This could be done by multiply biasMat in vertex shader
    outShadowCoord = (biasMat * ubo.lightSpaceMatrix * pushConsts.model ) * vec4(inPos, 1.0);
}
```

The range of depths in the depth buffer is 0.0 to 1.0 in Vulkan, where 1.0 lies at the far view plane and 0.0 at the near view plane. 

When we output a clip-space vertex position to gl_Position in the vertex shader, Vulkan/OpenGL automatically does a perspective divide e.g. transform clip-space coordinates in the range [-w,w] to [-1,1] by dividing the x, y and z component by the vector's w component. 

As the clip-space FragPosLightSpace is not passed to the fragment shader through gl_Position, we have to do this perspective divide ourselves

When using an orthographic projection matrix the w component of a vertex remains untouched so this step is actually quite meaningless. However, it is necessary when using perspective projection so keeping this line ensures it works with both projection matrices.

```glsl
//example code of Directional Shadow Mapping Fragment Shader(pass 2)
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

float textureProj(vec4 shadowCoord, vec2 off)
{
	float shadow = 1.0;
	if ( shadowCoord.z > -1.0 && shadowCoord.z < 1.0 ) 
	{
        //You can use xyzw, rgba (for colors), or stpq (for texture coordinates)
		float dist = texture( shadowMap, shadowCoord.st + off ).r;
		if ( shadowCoord.w > 0.0 && dist < shadowCoord.z ) 
		{
			shadow = ambient;
		}
	}
	return shadow;
}

float filterPCF(vec4 sc)
{
	ivec2 texDim = textureSize(shadowMap, 0);
	float scale = 1.5;
	float dx = scale * 1.0 / float(texDim.x);
	float dy = scale * 1.0 / float(texDim.y);

	float shadowFactor = 0.0;
	int count = 0;
	int range = 1;
	
	for (int x = -range; x <= range; x++)
	{
		for (int y = -range; y <= range; y++)
		{
			shadowFactor += textureProj(sc, vec2(dx*x, dy*y));
			count++;
		}
	
	}
	return shadowFactor / count;
}

void main() 
{	
	float shadow = (enablePCF == 1) ? filterPCF(inShadowCoord / inShadowCoord.w) : textureProj(inShadowCoord / inShadowCoord.w, vec2(0.0));

	vec3 N = (inNormal);
	vec3 L = (inLightVec);
	vec3 V = (inViewVec);
	vec3 H = normalize(L + V);

	vec3 diffuse = max(dot(N, L), ambient) * inColor;
	vec3 specular = max(pow(dot(H, N), 32), 0) * inColor * 0.25f;

	outFragColor = vec4((specular + diffuse) * shadow + vec3(0.25) * inColor, 1.0);
}

```

