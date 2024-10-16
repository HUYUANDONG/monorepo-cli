<template>
  <el-config-provider :locale="locale" :size="size">
    <!-- 开启水印 -->
    <el-watermark
      v-if="watermarkEnabled"
      :font="{ color: fontColor }"
      :content="defaultSettings.watermarkContent"
      :z-index="9999"
      class="wh-full"
    >
      <router-view />
    </el-watermark>
    <!-- 关闭水印 -->
    <router-view v-else />
  </el-config-provider>
</template>

<script setup lang="ts">
import { useAppStore, useSettingsStore } from "@web/store";
import defaultSettings from "@web/settings";
import { ThemeEnum } from "@web/enums/ThemeEnum";
import { SizeEnum } from "@web/enums/SizeEnum";

const appStore = useAppStore();
const settingsStore = useSettingsStore();

const locale = computed(() => appStore.locale);
const size = computed(() => appStore.size as SizeEnum);
const watermarkEnabled = computed(() => settingsStore.watermarkEnabled);

// 明亮/暗黑主题水印字体颜色适配
const fontColor = computed(() => {
  return settingsStore.theme === ThemeEnum.DARK
    ? "rgba(255, 255, 255, .15)"
    : "rgba(0, 0, 0, .15)";
});
</script>
