<h1 align='center' >1. Prerequisite</h1>

### 1.1 VkImageCreateInfo 、VkFramebufferCreateInfo and VkRenderPassBeginInfo.renderArea
```c
typedef struct VkImageCreateInfo {
    VkStructureType          sType;
    const void*              pNext;
    VkImageCreateFlags       flags;
    VkImageType              imageType;
    VkFormat                 format;
    VkExtent3D               extent;
    uint32_t                 mipLevels;
    uint32_t                 arrayLayers;
    VkSampleCountFlagBits    samples;
    VkImageTiling            tiling;
    VkImageUsageFlags        usage;
    VkSharingMode            sharingMode;
    uint32_t                 queueFamilyIndexCount;
    const uint32_t*          pQueueFamilyIndices;
    VkImageLayout            initialLayout;
} VkImageCreateInfo;
```

```c
typedef struct VkFramebufferCreateInfo {
    VkStructureType             sType;
    const void*                 pNext;
    VkFramebufferCreateFlags    flags;
    VkRenderPass                renderPass;
    uint32_t                    attachmentCount;
    const VkImageView*          pAttachments;
    uint32_t                    width;
    uint32_t                    height;
    uint32_t                    layers;
} VkFramebufferCreateInfo;
```

```c
typedef struct VkRenderPassBeginInfo {
    VkStructureType        sType;
    const void*            pNext;
    VkRenderPass           renderPass;
    VkFramebuffer          framebuffer;
    VkRect2D               renderArea;
    uint32_t               clearValueCount;
    const VkClearValue*    pClearValues;
} VkRenderPassBeginInfo;
```

Every VkFramebuffer object is created with a width/height that must be less than or equal to the width/height of all image subresources used by the framebuffer.

When beginning a render pass, the renderArea you provide must specify an area within the VkFramebuffer's area

RenderArea is the area of the framebuffer that will be changed by the renderpass.

### 1.2 Viewport and Scissor

```c
typedef struct VkViewport {
    float    x;
    float    y;
    float    width;
    float    height;
    float    minDepth;
    float    maxDepth;
} VkViewport;
```

```c
typedef struct VkRect2D {
    VkOffset2D    offset;
    VkExtent2D    extent;
} VkRect2D;
```

The viewport specifies how the normalized device coordinates are transformed into the pixel coordinates of the framebuffer.

Scissor is the area where you can render, this is similar to viewport in that regard but changing the scissor rectangle doesn't affect the coordinates.

If viewport is small than render area, what will happen?

> Nothing special, the render commands will render within the viewport. The other way around (render area smaller than the viewport) will result in undefined values in the framebuffer.