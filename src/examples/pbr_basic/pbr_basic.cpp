#include "VulkanExampleBase.h"
#include "VulkanglTFModel.h"

#define GRID_DIM 7

struct Textures {
	vks::TextureCubeMap environmentCube;
	//// Generated at runtime
	//vks::Texture2D lutBrdf;
	//vks::TextureCubeMap irradianceCube;
	//vks::TextureCubeMap prefilteredCube;
	// Object texture maps

	vks::Texture2D albedoMap;
	vks::Texture2D normalMap;
	vks::Texture2D aoMap;
	vks::Texture2D metallicMap;
	vks::Texture2D roughnessMap;
} textures;

struct UBOMatrices {
	glm::mat4 projection;
	glm::mat4 model;
	glm::mat4 view;
	glm::vec3 camPos;
};

struct UBOParams {
	glm::vec4 lights[4];
};

struct Meshes {
	std::vector<vkglTF::Model> objects;
	int32_t objectIndex = 0;
};

struct Material {
	// Parameter block used as push constant block
	struct PushBlock {
		float roughness;
		float metallic;
		float r, g, b;
	} params;
	std::string name;
	Material() {};
	Material(std::string n, glm::vec3 c, float r, float m) : name(n) {
		params.roughness = r;
		params.metallic = m;
		params.r = c.r;
		params.g = c.g;
		params.b = c.b;
	};
};

class VulkanExample : public VulkanExampleBase
{
public:

	VkPipelineLayout pipelineLayout;
	VkPipeline pipeline;
	VkDescriptorSetLayout descriptorSetLayout;
	VkDescriptorSet descriptorSet;

	// Default materials to select from
	std::vector<std::string> materialNames;
	std::vector<std::string> objectNames;
	std::vector<Material> materials;
	int32_t materialIndex = 0;
	UBOMatrices uboMatrices;
	Meshes models;
	UBOParams uboParamsLight;
	struct {
		vks::Buffer object;
		vks::Buffer params;
	} uniformBuffers;

	VulkanExample() : VulkanExampleBase(true) {
		title = "Physical based shading basics";

		camera.type = Camera::CameraType::firstperson;
		camera.setPosition(glm::vec3(10.0f, 13.0f, 1.8f));
		camera.setRotation(glm::vec3(-62.5f, 90.0f, 0.0f));
		camera.movementSpeed = 4.0f;
		camera.setPerspective(60.0f, (float)width / (float)height, 0.1f, 256.0f);
		camera.rotationSpeed = 0.25f;
		paused = true;
		timerSpeed *= 0.25f;


		materials.push_back(Material("Gold", glm::vec3(1.0f, 0.765557f, 0.336057f), 0.1f, 1.0f));
		materials.push_back(Material("Copper", glm::vec3(0.955008f, 0.637427f, 0.538163f), 0.1f, 1.0f));
		materials.push_back(Material("Chromium", glm::vec3(0.549585f, 0.556114f, 0.554256f), 0.1f, 1.0f));
		materials.push_back(Material("Nickel", glm::vec3(0.659777f, 0.608679f, 0.525649f), 0.1f, 1.0f));
		materials.push_back(Material("Titanium", glm::vec3(0.541931f, 0.496791f, 0.449419f), 0.1f, 1.0f));
		materials.push_back(Material("Cobalt", glm::vec3(0.662124f, 0.654864f, 0.633732f), 0.1f, 1.0f));
		materials.push_back(Material("Platinum", glm::vec3(0.672411f, 0.637331f, 0.585456f), 0.1f, 1.0f));
		materialIndex = 0;

		for (auto material : materials) {
			materialNames.push_back(material.name);
		}
		objectNames = { "Sphere", "Teapot", "Torusknot", "Venus" };
	}

	~VulkanExample()
	{
		vkDestroyPipeline(device, pipeline, nullptr);
		vkDestroyPipelineLayout(device, pipelineLayout, nullptr);
		vkDestroyDescriptorSetLayout(device, descriptorSetLayout, nullptr);
	}

	void prepare()
	{
		VulkanExampleBase::prepare();
		loadAssets();
		prepareUniformBuffers();
		setupDescriptorSetLayout();
		preparePipelines();
		setupDescriptorSets();
		buildCommandBuffers();
		prepared = true;
	}

	void draw()
	{
		VulkanExampleBase::prepareFrame();

		submitInfo.commandBufferCount = 1;
		submitInfo.pCommandBuffers = &drawCmdBuffers[currentBuffer];
		VK_CHECK_RESULT(vkQueueSubmit(queue, 1, &submitInfo, VK_NULL_HANDLE));

		VulkanExampleBase::submitFrame();
	}

	void render()
	{
		if (!prepared)
			return;
		draw();
	}


	virtual void viewChanged()
	{
		updateUniformBuffers();
	}

	void loadAssets()
	{
		std::vector<std::string> filenames = {"sphere.gltf", "teapot.gltf", "torusknot.gltf", "venus.gltf" };
		models.objects.resize(filenames.size());
		for (size_t i = 0; i < filenames.size(); i++) {
			models.objects[i].loadFromFile(getAssetPath() + "models/" + filenames[i], vulkanDevice, queue, vkglTF::FileLoadingFlags::PreTransformVertices | vkglTF::FileLoadingFlags::FlipY);
		}
		textures.environmentCube.loadFromFile(getAssetPath() + "textures/ktx2/aircraft_workshop_01_4k.ktx2", VK_FORMAT_R16G16B16A16_SFLOAT, vulkanDevice, queue);
		textures.albedoMap.loadFromFile(getAssetPath() + "textures/ktx2/rustediron2_basecolor.ktx2", VK_FORMAT_R8G8B8A8_UNORM, vulkanDevice, queue);
		textures.normalMap.loadFromFile(getAssetPath() + "models/cerberus/normal.ktx", VK_FORMAT_R8G8B8A8_UNORM, vulkanDevice, queue);
		textures.aoMap.loadFromFile(getAssetPath() + "models/cerberus/ao.ktx", VK_FORMAT_R8_UNORM, vulkanDevice, queue);
		textures.metallicMap.loadFromFile(getAssetPath() + "textures/ktx2/rustediron2_metallic.ktx2", VK_FORMAT_R8_UNORM, vulkanDevice, queue);
		textures.roughnessMap.loadFromFile(getAssetPath() + "textures/ktx2/rustediron2_roughness.ktx2", VK_FORMAT_R8_UNORM, vulkanDevice, queue);
	}

	void prepareUniformBuffers()
	{
		// Object vertex shader uniform buffer
		VK_CHECK_RESULT(vulkanDevice->createBuffer(
			VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT,
			VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT,
			&uniformBuffers.object,
			sizeof(uboMatrices)));

		// Shared parameter uniform buffer
		VK_CHECK_RESULT(vulkanDevice->createBuffer(
			VK_BUFFER_USAGE_UNIFORM_BUFFER_BIT,
			VK_MEMORY_PROPERTY_HOST_VISIBLE_BIT | VK_MEMORY_PROPERTY_HOST_COHERENT_BIT,
			&uniformBuffers.params,
			sizeof(uboParamsLight)));

		// Map persistent
		VK_CHECK_RESULT(uniformBuffers.object.map());
		VK_CHECK_RESULT(uniformBuffers.params.map());

		updateUniformBuffers();
		updateLights();
	}

	void setupDescriptorSetLayout() {
		std::vector<VkDescriptorSetLayoutBinding> setLayoutBindings = {
			vks::initializers::descriptorSetLayoutBinding(VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER, VK_SHADER_STAGE_VERTEX_BIT | VK_SHADER_STAGE_FRAGMENT_BIT, 0),
			vks::initializers::descriptorSetLayoutBinding(VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER, VK_SHADER_STAGE_FRAGMENT_BIT, 1),
			vks::initializers::descriptorSetLayoutBinding(VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, VK_SHADER_STAGE_FRAGMENT_BIT, 2),
			vks::initializers::descriptorSetLayoutBinding(VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, VK_SHADER_STAGE_FRAGMENT_BIT,5),
			vks::initializers::descriptorSetLayoutBinding(VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, VK_SHADER_STAGE_FRAGMENT_BIT, 6),
			vks::initializers::descriptorSetLayoutBinding(VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, VK_SHADER_STAGE_FRAGMENT_BIT, 7),
			vks::initializers::descriptorSetLayoutBinding(VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, VK_SHADER_STAGE_FRAGMENT_BIT, 8),
			vks::initializers::descriptorSetLayoutBinding(VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, VK_SHADER_STAGE_FRAGMENT_BIT, 9),
		};

		VkDescriptorSetLayoutCreateInfo descriptorLayout = vks::initializers::descriptorSetLayoutCreateInfo(setLayoutBindings);

		VK_CHECK_RESULT(vkCreateDescriptorSetLayout(device, &descriptorLayout, nullptr, &descriptorSetLayout));
	}

	void setupDescriptorSets() {
		std::vector<VkDescriptorPoolSize> poolSizes = {
			vks::initializers::descriptorPoolSize(VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER, 4),
			vks::initializers::descriptorPoolSize(VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, 10)
		};

		VkDescriptorPoolCreateInfo descriptorPoolInfo =
			vks::initializers::descriptorPoolCreateInfo(poolSizes, 2);

		VK_CHECK_RESULT(vkCreateDescriptorPool(device, &descriptorPoolInfo, nullptr, &descriptorPool));

		VkDescriptorSetAllocateInfo allocInfo =
			vks::initializers::descriptorSetAllocateInfo(descriptorPool, &descriptorSetLayout, 1);  //ֻ��Ҫһ�����ż���

		// 3D object descriptor set
		VK_CHECK_RESULT(vkAllocateDescriptorSets(device, &allocInfo, &descriptorSet));

		std::vector<VkWriteDescriptorSet> writeDescriptorSets = {
			vks::initializers::writeDescriptorSet(descriptorSet, VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER, 0, &uniformBuffers.object.descriptor),
			vks::initializers::writeDescriptorSet(descriptorSet, VK_DESCRIPTOR_TYPE_UNIFORM_BUFFER, 1, &uniformBuffers.params.descriptor),
			vks::initializers::writeDescriptorSet(descriptorSet, VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, 5, &textures.albedoMap.descriptor),
			vks::initializers::writeDescriptorSet(descriptorSet, VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, 6, &textures.normalMap.descriptor),
			vks::initializers::writeDescriptorSet(descriptorSet, VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, 7, &textures.aoMap.descriptor),
			vks::initializers::writeDescriptorSet(descriptorSet, VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, 8, &textures.metallicMap.descriptor),
			vks::initializers::writeDescriptorSet(descriptorSet, VK_DESCRIPTOR_TYPE_COMBINED_IMAGE_SAMPLER, 9, &textures.roughnessMap.descriptor),
		};
		vkUpdateDescriptorSets(device, static_cast<uint32_t>(writeDescriptorSets.size()), writeDescriptorSets.data(), 0, NULL);
	}

	void preparePipelines() {

		VkPipelineLayoutCreateInfo pipelineLayoutCreateInfo =
			vks::initializers::pipelineLayoutCreateInfo(&descriptorSetLayout, 1);

		std::vector<VkPushConstantRange> pushConstantRanges = {
			vks::initializers::pushConstantRange(VK_SHADER_STAGE_VERTEX_BIT, sizeof(glm::vec3), 0),
			vks::initializers::pushConstantRange(VK_SHADER_STAGE_FRAGMENT_BIT, sizeof(Material::PushBlock), sizeof(glm::vec3)),
		};

		pipelineLayoutCreateInfo.pushConstantRangeCount = 2;
		pipelineLayoutCreateInfo.pPushConstantRanges = pushConstantRanges.data();

		VK_CHECK_RESULT(vkCreatePipelineLayout(device, &pipelineLayoutCreateInfo, nullptr, &pipelineLayout));


		VkPipelineInputAssemblyStateCreateInfo inputAssemblyState = vks::initializers::pipelineInputAssemblyStateCreateInfo(VK_PRIMITIVE_TOPOLOGY_TRIANGLE_LIST, 0, VK_FALSE);
		VkPipelineRasterizationStateCreateInfo rasterizationState = vks::initializers::pipelineRasterizationStateCreateInfo(VK_POLYGON_MODE_FILL, VK_CULL_MODE_BACK_BIT, VK_FRONT_FACE_COUNTER_CLOCKWISE);
		VkPipelineColorBlendAttachmentState blendAttachmentState = vks::initializers::pipelineColorBlendAttachmentState(0xf, VK_FALSE);
		VkPipelineColorBlendStateCreateInfo colorBlendState = vks::initializers::pipelineColorBlendStateCreateInfo(1, &blendAttachmentState);
		VkPipelineDepthStencilStateCreateInfo depthStencilState = vks::initializers::pipelineDepthStencilStateCreateInfo(VK_FALSE, VK_FALSE, VK_COMPARE_OP_LESS_OR_EQUAL);
		VkPipelineViewportStateCreateInfo viewportState = vks::initializers::pipelineViewportStateCreateInfo(1, 1);
		VkPipelineMultisampleStateCreateInfo multisampleState = vks::initializers::pipelineMultisampleStateCreateInfo(VK_SAMPLE_COUNT_1_BIT);
		std::vector<VkDynamicState> dynamicStateEnables = { VK_DYNAMIC_STATE_VIEWPORT, VK_DYNAMIC_STATE_SCISSOR };
		VkPipelineDynamicStateCreateInfo dynamicState = vks::initializers::pipelineDynamicStateCreateInfo(dynamicStateEnables);
		VkGraphicsPipelineCreateInfo pipelineCI = vks::initializers::pipelineCreateInfo(pipelineLayout, renderPass);

		std::array<VkPipelineShaderStageCreateInfo, 2> shaderStages;
		pipelineCI.pInputAssemblyState = &inputAssemblyState;
		pipelineCI.pRasterizationState = &rasterizationState;
		pipelineCI.pColorBlendState = &colorBlendState;
		pipelineCI.pMultisampleState = &multisampleState;
		pipelineCI.pViewportState = &viewportState;
		pipelineCI.pDepthStencilState = &depthStencilState;
		pipelineCI.pDynamicState = &dynamicState;
		pipelineCI.stageCount = static_cast<uint32_t>(shaderStages.size());
		pipelineCI.pStages = shaderStages.data();
		pipelineCI.pVertexInputState = vkglTF::Vertex::getPipelineVertexInputState({ vkglTF::VertexComponent::Position, vkglTF::VertexComponent::Normal , vkglTF::VertexComponent::UV });

		// PBR pipeline
		shaderStages[0] = loadShader(getShadersPath() + "pbr_basic/vert.spv", VK_SHADER_STAGE_VERTEX_BIT);
		shaderStages[1] = loadShader(getShadersPath() + "pbr_basic/frag.spv", VK_SHADER_STAGE_FRAGMENT_BIT);
		// Enable depth test and write
		depthStencilState.depthWriteEnable = VK_TRUE;
		depthStencilState.depthTestEnable = VK_TRUE;
		VK_CHECK_RESULT(vkCreateGraphicsPipelines(device, pipelineCache, 1, &pipelineCI, nullptr, &pipeline));

	}

	void buildCommandBuffers()
	{
		VkCommandBufferBeginInfo cmdBufInfo = vks::initializers::commandBufferBeginInfo();

		VkClearValue clearValues[2];
		clearValues[0].color = defaultClearColor;
		clearValues[1].depthStencil = { 1.0f, 0 };

		VkRenderPassBeginInfo renderPassBeginInfo = vks::initializers::renderPassBeginInfo();
		renderPassBeginInfo.renderPass = renderPass;
		renderPassBeginInfo.renderArea.offset.x = 0;
		renderPassBeginInfo.renderArea.offset.y = 0;
		renderPassBeginInfo.renderArea.extent.width = width;
		renderPassBeginInfo.renderArea.extent.height = height;
		renderPassBeginInfo.clearValueCount = 2;
		renderPassBeginInfo.pClearValues = clearValues;

		for (int32_t i = 0; i < drawCmdBuffers.size(); ++i)
		{
			// Set target frame buffer
			renderPassBeginInfo.framebuffer = frameBuffers[i];

			VK_CHECK_RESULT(vkBeginCommandBuffer(drawCmdBuffers[i], &cmdBufInfo));

			vkCmdBeginRenderPass(drawCmdBuffers[i], &renderPassBeginInfo, VK_SUBPASS_CONTENTS_INLINE);

			VkViewport viewport = vks::initializers::viewport((float)width, (float)height, 0.0f, 1.0f);
			vkCmdSetViewport(drawCmdBuffers[i], 0, 1, &viewport);

			VkRect2D scissor = vks::initializers::rect2D(width, height, 0, 0);
			vkCmdSetScissor(drawCmdBuffers[i], 0, 1, &scissor);

			// Objects
			vkCmdBindPipeline(drawCmdBuffers[i], VK_PIPELINE_BIND_POINT_GRAPHICS, pipeline);
			vkCmdBindDescriptorSets(drawCmdBuffers[i], VK_PIPELINE_BIND_POINT_GRAPHICS, pipelineLayout, 0, 1, &descriptorSet, 0, NULL);

			Material mat = materials[materialIndex];

			//#define SINGLE_ROW 1
#ifdef SINGLE_ROW
			mat.params.metallic = 1.0;

			uint32_t objcount = 10;
			for (uint32_t x = 0; x < objcount; x++) {
				glm::vec3 pos = glm::vec3(float(x - (objcount / 2.0f)) * 2.5f, 0.0f, 0.0f);
				mat.params.roughness = glm::clamp((float)x / (float)objcount, 0.005f, 1.0f);
				vkCmdPushConstants(drawCmdBuffers[i], pipelineLayout, VK_SHADER_STAGE_VERTEX_BIT, 0, sizeof(glm::vec3), &pos);
				vkCmdPushConstants(drawCmdBuffers[i], pipelineLayout, VK_SHADER_STAGE_FRAGMENT_BIT, sizeof(glm::vec3), sizeof(Material::PushBlock), &mat);
				models.objects[models.objectIndex].draw(drawCmdBuffers[i]);
			}
#else
			for (uint32_t y = 0; y < GRID_DIM; y++) {
				for (uint32_t x = 0; x < GRID_DIM; x++) {
					glm::vec3 pos = glm::vec3(float(x - (GRID_DIM / 2.0f)) * 2.5f, 0.0f, float(y - (GRID_DIM / 2.0f)) * 2.5f);
					vkCmdPushConstants(drawCmdBuffers[i], pipelineLayout, VK_SHADER_STAGE_VERTEX_BIT, 0, sizeof(glm::vec3), &pos);
					mat.params.metallic = glm::clamp((float)x / (float)(GRID_DIM - 1), 0.1f, 1.0f);
					mat.params.roughness = glm::clamp((float)y / (float)(GRID_DIM - 1), 0.05f, 1.0f);
					vkCmdPushConstants(drawCmdBuffers[i], pipelineLayout, VK_SHADER_STAGE_FRAGMENT_BIT, sizeof(glm::vec3), sizeof(Material::PushBlock), &mat);
					models.objects[models.objectIndex].draw(drawCmdBuffers[i]);
				}
			}
#endif
			drawUI(drawCmdBuffers[i]);

			vkCmdEndRenderPass(drawCmdBuffers[i]);

			VK_CHECK_RESULT(vkEndCommandBuffer(drawCmdBuffers[i]));
		}
	}


	void updateUniformBuffers()
	{
		// 3D object
		uboMatrices.projection = camera.matrices.perspective;
		uboMatrices.view = camera.matrices.view;
		uboMatrices.model = glm::rotate(glm::mat4(1.0f), glm::radians(-90.0f + (models.objectIndex == 1 ? 45.0f : 0.0f)), glm::vec3(0.0f, 1.0f, 0.0f));
		uboMatrices.camPos = camera.position * -1.0f;
		memcpy(uniformBuffers.object.mapped, &uboMatrices, sizeof(uboMatrices));
	}

	void updateLights()
	{
		const float p = 15.0f;
		uboParamsLight.lights[0] = glm::vec4(-p, -p * 0.5f, -p, 1.0f);
		uboParamsLight.lights[1] = glm::vec4(-p, -p * 0.5f, p, 1.0f);
		uboParamsLight.lights[2] = glm::vec4(p, -p * 0.5f, p, 1.0f);
		uboParamsLight.lights[3] = glm::vec4(p, -p * 0.5f, -p, 1.0f);

		if (!paused)
		{
			uboParamsLight.lights[0].x = sin(glm::radians(timer * 360.0f)) * 20.0f;
			uboParamsLight.lights[0].z = cos(glm::radians(timer * 360.0f)) * 20.0f;
			uboParamsLight.lights[1].x = cos(glm::radians(timer * 360.0f)) * 20.0f;
			uboParamsLight.lights[1].y = sin(glm::radians(timer * 360.0f)) * 20.0f;
		}

		memcpy(uniformBuffers.params.mapped, &uboParamsLight, sizeof(uboParamsLight));
	}

	//UI
	virtual void OnUpdateUIOverlay(vks::UIOverlay* overlay)
	{
		if (overlay->header("Settings")) {
			if (overlay->comboBox("Material", &materialIndex, materialNames)) {
				buildCommandBuffers();
			}
			if (overlay->comboBox("Object type", &models.objectIndex, objectNames)) {
				updateUniformBuffers();
				buildCommandBuffers();
			}
		}
	}
};

VULKAN_EXAMPLE_MAIN()