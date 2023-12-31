<h1 align='center' >1. Prerequisite</h1>



<h1 align='center' > 2. Execution and Memory Dependencies</h1>

### 2.1 Operation

#### 2.1.1 Operation Overview
- An operation is an arbitrary amount of work to be executed on the host, a device, or an external entity such as a presentation engine.
- Operations defined by the command.
- The work performed by an action or synchronization command consists of multiple operations, which are performed as a sequence of logically independent steps known as pipeline stages.
- Drawing commands, dispatching commands, copy commands, clear commands, and synchronization commands all execute in different sets of pipeline stages. Synchronization commands do not execute in a defined pipeline.

#### 2.1.2 Availability, Visibility, and Domain Operations
- Three additional types of operations are used to control memory access:
    - **Availability operations** 
        - Cause the values generated by specified memory write accesses to become available to a memory domain for future access. 
        - For an availability operation, the source scope is a set of (agent,reference,memory location) tuples, and the destination scope is a set of memory domains.
        - Any available value remains available until a subsequent write to the same memory location occurs or the memory is freed. 
    - **Memory domain operations** 
        - Cause writes that are available to a source memory domain to become available to a destination memory domain.
        - For a memory domain operation, the source scope is a memory domain and the destination scope is a memory domain.
    - **Visibility operations** 
        - Cause values available to a memory domain to become visible to specified memory accesses.
        - For a visibility operation, the source scope is a set of memory domains and the destination scope is a set of (agent,reference,memory location) tuples.
- The following operations generate availability, visibility, and domain operations.
    - An operation that performs a memory dependency generates:
        - If the source access mask includes **VK_ACCESS_HOST_WRITE_BIT**, then the dependency includes a
        **memory domain operation** from **host domain** to **device domain**.
        - If the destination access mask includes **VK_ACCESS_HOST_READ_BIT** or **VK_ACCESS_HOST_WRITE_BIT**, then the dependency includes a memory domain operation from **device domain** to **host domain**.
        - An availability operation with source scope of **all writes in the first access scope of the dependency** and a destination scope of **the device domain**.
        - A visibility operation with source scope of **the device domain** and destination scope of **the second access scope of the dependency**.
    - **vkFlushMappedMemoryRanges** 
        - performs an availability operation
        - source scope : (agents, references) = (all host threads, all mapped memory ranges passed to the command)
        - destination scope ：the host domain
    - **vkInvalidateMappedMemoryRanges**
        - performs an visibility operation
        - source scope ：the host domain
        - destination scope : (agents, references) = (all host threads, all mapped memory ranges passed to the command)
    - **vkQueueSubmit**
        - performs a memory domain operation from host to device
        - performs a visibility operation 
            - source scope ：the device domain 
            - destination scope : all agents and references on the device

### 2.2 Synchronization Scope(同步域)
- The synchronization scopes define which other operations a synchronization command is able to create execution dependencies with.
- Synchronization commands introduce explicit execution dependencies, and memory dependencies between two sets of operations defined by the command’s two synchronization scopes.
- Any type of operation that is not in a synchronization command’s synchronization scopes will not be included in the resulting dependency.

### 2.3 Execution Dependency 
- An execution dependency is a guarantee that for two sets of operations, the first set must happen before the second set. If an operation happens-before another operation, then the first operation must complete before the second operation is initiated.
- Execution dependencies alone are not sufficient to guarantee that values resulting from writes in one set of operations can be read from another set of operations.（由于缓存，仅凭执行依赖关系并不足以保证从一组操作中的写入所产生的值可以从另一组操作中读取）

### 2.4 Memory Dependency
- A memory dependency is an execution dependency which includes availability and visibility operations such that(内存依赖是一种包含可用可见操作的执行依赖):
    - The first set of operations happens-before the availability operation.
    - The availability operation happens-before the visibility operation.
    - The visibility operation happens-before the second set of operations.
- A memory dependency enforces availability and visibility of memory accesses and execution order
between two sets of operations
- Memory dependency MemDep guarantees that:
    - Memory writes in ScopedMemOps1 are made available
    - Available memory writes, including those from ScopedMemOps1 , are made visible to ScopedMemOps2

### 2.5 Access Scopes
- The specific memory accesses that are made available and visible are defined by the access scopes of a memory dependency.
    - Any type of access that is in a memory dependency’s first access scope and occurs in ScopedOps1 is made available.
    - Any type of access that is in a memory dependency’s second access scope and occurs in ScopedOps2 has any available writes made visible to it.

### 2.6 Note
- Write-after-read hazards can be solved with just an execution dependency
- Read-after-write and write-after-write hazards need appropriate memory dependencies to be included between them


<h1 align='center' >3. Image Layout Transitions</h1>

### 3.1 Image Layouts
- Images are stored in opaque layouts in memory.
- Each layout has limitations on what kinds of operations are supported for image subresources using the layout.
- Transitions can happen with an image :
    - memory barrier, included as part of a vkCmdPipelineBarrier or a vkCmdWaitEvents command buffer command
    - a subpass dependency within a render pass
- Image layout is per-image subresource. Separate image subresources of the same image can be in different layouts at the same time, with the exception that depth and stencil aspects of a given image subresource can only be in different layouts if the separateDepthStencilLayouts feature is enabled.
- Upon creation, all image subresources of an image are initially in the same layout, where that layout is selected by the **VkImageCreateInfo::initialLayout** member. The initialLayout must be either **VK_IMAGE_LAYOUT_UNDEFINED** or **VK_IMAGE_LAYOUT_PREINITIALIZED**.



### 3.2 Image Layout Transitions
- When a layout transition is specified in a memory dependency, it happens-after the **availability operations** in the memory dependency, and happens-before the **visibility operations**.
- Image layout transitions may perform read and write, so applications must ensure that all memory writes have been made available before a layout transition is executed.
- Available memory is automatically made visible to a layout transition
- Writes performed by a layout transition are automatically made available.
- Layout transitions always apply to a particular image subresource range.
- The old layout must either be **VK_IMAGE_LAYOUT_UNDEFINED**, or match the current layout of the image subresource range. If the old layout matches the current layout of the image subresource range, the transition preserves the contents of that range. If the old layout is **VK_IMAGE_LAYOUT_UNDEFINED**, the contents of that range may be discarded.
- Applications must ensure that layout transitions happen-after all operations accessing the image with the old layout, and happen-before any operations that will access the image with the new layout.


<h1 align='center' >4.Pipeline Stages</h1>

- The work performed by an action or synchronization command consists of multiple operations, which are performed as a sequence of logically independent steps known as pipeline stages.
- The exact pipeline stages executed depend on the particular command that is used, and current command buffer state when the command was recorded. 
- Drawing commands, dispatching commands, copy commands, clear commands, and synchronization commands all execute in different sets of pipeline stages. 
- Synchronization commands do not execute in a defined pipeline stage.
- If a synchronization command includes a source stage mask, its first synchronization scope only includes execution of the pipeline stages specified in that mask and any logically earlier stages. Its first access scope only includes memory accesses performed by pipeline stages explicitly specified in the source stage mask.
- If a synchronization command includes a destination stage mask, its second synchronization scope only includes execution of the pipeline stages specified in that mask and any logically later stages. Its second access scope only includes memory accesses performed by pipeline stages explicitly specified in the destination stage mask.
- Access scopes do not interact with the logically earlier or later stages for either scope - only the stages the app specifies are considered part of each access scope.

<h1 align='center' >5. Access Types</h1>

- Memory in Vulkan can be accessed from within shader invocations and via some fixed-function stages of the pipeline. 
- The access type is a function of the descriptor type used, or how a fixed-function stage accesses memory.
- Certain access types are only performed by a subset of pipeline stages.
- An application must not specify an access flag in a synchronization command if it does not include a pipeline stage in the corresponding stage mask that is able to perform accesses of that type