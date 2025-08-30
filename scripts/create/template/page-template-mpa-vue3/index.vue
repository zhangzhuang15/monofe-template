<script lang="ts" setup>
import { defineProps, ref} from "vue"
import { NButton, NInput } from "naive-ui";

const props = defineProps<{ appID?: number | string }>()
const count = ref(0)
const handleClick = () => {
  count.value += 1
}
</script>

<template>
  <div class="page-container">
    <div class="success-message">vue 新页面创建成功！</div>
    <div class="content">
      <div style="justify-content: center; align-items: center; padding: 20px;">  
        <h3>{{props.appID || 'appID is lost'}}</h3>
        <n-button type="primary" @click="handleClick">点击我</n-button>
        <div class="input-wrapper">
          <n-input v-model:value="count" placeholder="请输入内容" />
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-top: 100px;
}

.success-message {
  font-size: 24px;
  color: #34c759;
  margin-bottom: 32px;
}

.content {
  width: 400px;
  text-align: center;
  border: 1px solid #e4e7ed;
  border-radius: 4px;
  padding: 24px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
}

.input-wrapper {
  margin-top: 16px;
}
</style>