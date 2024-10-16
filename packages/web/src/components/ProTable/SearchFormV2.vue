<template>
  <div v-if="columns.length" class="card table-search">
    <el-form ref="formRef" :model="searchParam">
      <Grid
        ref="gridRef"
        :collapsed="collapsed"
        :gap="[20, 0]"
        :cols="searchCol"
      >
        <GridItem
          v-for="(item, index) in columns"
          :key="item.prop"
          v-bind="getResponsive(item)"
          :index="index"
        >
          <el-form-item>
            <template #label v-if="item.search?.label">
              <el-space :size="4">
                <span>{{ `${item.search?.label ?? item.label}` }}</span>
                <el-tooltip
                  v-if="item.search?.tooltip"
                  effect="dark"
                  :content="item.search?.tooltip"
                  placement="top"
                >
                  <i :class="'iconfont icon-yiwen'"></i>
                </el-tooltip>
              </el-space>
              <span>&nbsp;:</span>
            </template>
            <SearchFormItem :column="item" :search-param="searchParam" />
          </el-form-item>
        </GridItem>
        <GridItem>
          <div class="operation">
            <el-button type="primary" :icon="Search" @click="search">
              搜索
            </el-button>
            <el-button :icon="Refresh" @click="reset">重置</el-button>
            <el-button
              v-if="showCollapse"
              type="primary"
              link
              class="search-isOpen"
              @click="collapsed = !collapsed"
            >
              {{ collapsed ? "展开" : "合并" }}
              <el-icon class="el-icon--right">
                <component :is="collapsed ? ArrowDown : ArrowUp"></component>
              </el-icon>
            </el-button>
          </div>
        </GridItem>
      </Grid>
    </el-form>
  </div>
</template>
<script setup lang="ts" name="SearchFormV2">
import { BreakPoint } from "../Grid/type";
import { ColumnProps } from "./type";
import { Refresh, Search, ArrowDown, ArrowUp } from "@element-plus/icons-vue";
import SearchFormItem from "./SearchFormItemV2.vue";
import Grid from "../Grid/index.vue";
import GridItem from "../Grid/GridItem.vue";

interface ProTableProps {
  columns?: ColumnProps[]; // 搜索配置列
  searchParam?: { [key: string]: any }; // 搜索参数
  searchCol: number | Record<BreakPoint, number>;
  search: (params: any) => void; // 搜索方法
  reset: (params: any) => void; // 重置方法
}

// 默认值
const props = withDefaults(defineProps<ProTableProps>(), {
  columns: () => [],
  searchParam: () => ({}),
});

// 获取响应式设置
const getResponsive = (item: ColumnProps) => {
  return {
    span: item.search?.span,
    offset: item.search?.offset ?? 0,
    xs: item.search?.xs,
    sm: item.search?.sm,
    md: item.search?.md,
    lg: item.search?.lg,
    xl: item.search?.xl,
  };
};

// 是否默认折叠搜索项
const collapsed = ref(false);

// 获取响应式断点
const gridRef = ref();
const breakPoint = computed<BreakPoint>(() => gridRef.value?.breakPoint);

// 判断是否显示 展开/合并 按钮
const showCollapse = computed(() => {
  let show = false;
  props.columns.reduce((prev, current) => {
    prev +=
      (current.search![breakPoint.value]?.span ?? current.search?.span ?? 1) +
      (current.search![breakPoint.value]?.offset ??
        current.search?.offset ??
        0);
    if (typeof props.searchCol !== "number") {
      if (prev >= props.searchCol[breakPoint.value]) show = true;
    } else {
      if (prev >= props.searchCol) show = true;
    }
    return prev;
  }, 0);
  return show;
});
</script>
<style lang="scss" scoped>
.table-search {
  margin-bottom: 10px;
  display: flex;
  :deep(.el-form) {
    .el-form-item__content > * {
      width: 100%;
    }

    // 去除时间选择器上下 padding
    .el-range-editor.el-input__wrapper {
      padding: 0 10px;
    }
  }
  .operation {
    display: flex;
    align-items: center;
    margin-bottom: 18px;
  }
}
.card {
  box-sizing: border-box;
  margin-bottom: 0;
  overflow-x: hidden;
  background-color: var(--el-bg-color);
  //   border: 1px solid var(--el-border-color-light);
  //   border-bottom: 0 !important;
  //   border-radius: 6px 6px 0 0 !important;
}
.search-form {
  flex-grow: 1;
}
.search-btn {
  flex-shrink: 0;
  margin-left: 100px;
}
</style>
