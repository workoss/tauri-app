<template>
  <div class="mb-4">
    <el-button>Default</el-button>
    <el-button type="primary">Primary</el-button>
    <el-button type="success">Success</el-button>
    <el-button type="info">Info</el-button>
    <el-button type="warning">Warning</el-button>
    <el-button type="danger">Danger</el-button>
  </div>
</template>

<script setup lang="ts">
import { ElButton } from "element-plus";
</script>

<style>
.mb-4 {
  margin-bottom: 16px;
}
</style>
