<h1 align='center' >1. Prerequisite</h1>

### 1.1 [SPIR-V规范代码转为可阅读的的SPIR-V代码](https://blog.csdn.net/wcj0626/article/details/122725075)

#### 1.1.1 没有结果
```glsl
length |  opCode  | Param1 | ...    -> OpX Param1 ...
```
#### 1.1.2 有结果，但没有类型
```glsl
length | opcode | Result <id> | Param1 | ...  -> %id = OpX param1 ...
```
#### 1.1.3 有结果，有类型
```glsl
length | opcode | Result Type <tid> | Result <id> | Param1 | ... -> %id = OpX %tid Param1 ...
```