<h1 align='center' >1. Prerequisite</h1>

### 1.1 Directional Shadow Mapping

#### 1.1.1 Light space transform


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

**Step 4:**
Rendering shadow in next pass
```glsl
//example code of Directional Shadow Mapping Vertex Shader(pass 2)
layout (binding = 0) uniform UBO 
{
	mat4 projection;
	mat4 view;
	mat4 model;
	vec4 camPos;
	mat4 lightSpaceMatrix;
	vec4 lightPos;
	float zNear;
	float zFar;
} ubo;

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
	gl_Position = ubo.projection * ubo.view * ubo.model * vec4(inPos.xyz, 1.0);
	
    vec4 pos = ubo.model * vec4(inPos, 1.0);  //world space pos
    outNormal = normalize(mat3(ubo.model) * inNormal);   //world space normal

    outLightVec = normalize(ubo.lightPos.xyz - pos.xyz);
    outViewVec = normalize(ubo.camPos.xyz - pos.xyz);			

	outShadowCoord = (biasMat * ubo.lightSpaceMatrix * ubo.model ) * vec4(inPos, 1.0);	
}
```

The range of depths in the depth buffer is 0.0 to 1.0 in Vulkan, where 1.0 lies at the far view plane and 0.0 at the near view plane. 
```glsl
//example code of Directional Shadow Mapping Fragment Shader(pass 2)
#version 330 core
layout (location = 0) in vec3 aPos;
layout (location = 1) in vec3 aNormal;
layout (location = 2) in vec2 aTexCoords;

out VS_OUT {
    vec3 FragPos;
    vec3 Normal;
    vec2 TexCoords;
    vec4 FragPosLightSpace;
} vs_out;

uniform mat4 projection;
uniform mat4 view;
uniform mat4 model;
uniform mat4 lightSpaceMatrix;

void main()
{    
    vs_out.FragPos = vec3(model * vec4(aPos, 1.0));
    vs_out.Normal = transpose(inverse(mat3(model))) * aNormal;
    vs_out.TexCoords = aTexCoords;
    vs_out.FragPosLightSpace = lightSpaceMatrix * vec4(vs_out.FragPos, 1.0);
    gl_Position = projection * view * vec4(vs_out.FragPos, 1.0);
}
```

