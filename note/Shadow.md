<h1 align='center' >1. Prerequisite</h1>

### 1.1 Directional Shadow Mapping

#### 1.1.1 Light space transform
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


```glsl
//example code of Directional Shadow Mapping Vertex Shader
#version 330 core
layout (location = 0) in vec3 aPos;

uniform mat4 lightSpaceMatrix;
uniform mat4 model;

void main()
{
    gl_Position = lightSpaceMatrix * model * vec4(aPos, 1.0);
}  
```