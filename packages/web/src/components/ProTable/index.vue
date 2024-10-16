<!-- 📚📚📚 Pro-Table 文档: https://juejin.cn/post/7166068828202336263 -->

<template>
  <!-- 查询表单 -->
  <div class="table__block">
    <SearchForm
      v-show="isShowSearch"
      :search="_search"
      :reset="_reset"
      :columns="searchColumns"
      :search-param="searchParam"
      :search-col="searchCol"
    >
      <div class="table-header">
        <div class="header-button-lf">
          <slot
            name="tableHeader"
            :selected-list="selectedList"
            :selected-list-ids="selectedListIds"
            :is-selected="isSelected"
          />
        </div>
        <div v-if="toolButton" class="header-button-ri">
          <slot name="toolButton">
            <el-button
              v-if="showToolButton('refresh')"
              :icon="Refresh"
              circle
              @click="getTableList"
            />
            <el-button
              v-if="showToolButton('setting') && columns.length"
              :icon="Operation"
              circle
              @click="openColSetting"
            />
            <el-button
              v-if="showToolButton('search') && searchColumns?.length"
              :icon="Search"
              circle
              @click="isShowSearch = !isShowSearch"
            />
          </slot>
        </div>
      </div>
    </SearchForm>

    <!-- 表格主体 -->
    <div class="card table-main">
      <!-- 表格主体 -->
      <el-table
        ref="tableRef"
        v-bind="$attrs"
        :id="uuid"
        :data="processTableData"
        :border="border"
        :row-key="rowKey"
        @selection-change="selectionChange"
      >
        <!-- 默认插槽 -->
        <slot />
        <template v-for="item in tableColumns" :key="item">
          <!-- selection || radio || index || expand || sort -->
          <el-table-column
            v-if="item.type && columnTypes.includes(item.type)"
            v-bind="item"
            :align="item.align ?? 'center'"
            :reserve-selection="item.type == 'selection'"
          >
            <template #default="scope">
              <!-- expand -->
              <template v-if="item.type == 'expand'">
                <component
                  :is="item.render"
                  v-bind="scope"
                  v-if="item.render"
                />
                <slot v-else :name="item.type" v-bind="scope" />
              </template>
              <!-- radio -->
              <el-radio
                v-if="item.type == 'radio'"
                v-model="radio"
                :label="scope.row[rowKey]"
              >
                <i></i>
              </el-radio>
              <!-- sort -->
              <el-tag v-if="item.type == 'sort'" class="move">
                <el-icon><DCaret /></el-icon>
              </el-tag>
            </template>
          </el-table-column>
          <!-- other -->
          <TableColumn v-else :column="item">
            <template v-for="slot in Object.keys($slots)" #[slot]="scope">
              <slot :name="slot" v-bind="scope" />
            </template>
          </TableColumn>
        </template>
        <!-- 插入表格最后一行之后的插槽 -->
        <template #append>
          <slot name="append" />
        </template>
        <!-- 无数据 -->
        <template #empty>
          <div class="table-empty">
            <slot name="empty">
              <!-- <img src="@/assets/images/notData.png" alt="notData" /> -->
              <div>暂无数据</div>
            </slot>
          </div>
        </template>
      </el-table>
      <!-- 分页组件 -->
      <slot name="pagination">
        <Pagination
          v-if="pagination"
          :pageable="pageable"
          :handle-size-change="_handleSizeChange"
          :handle-current-change="_handleCurrentChange"
        />
      </slot>
    </div>
    <!-- 列设置 -->
    <ColSetting
      v-if="toolButton"
      ref="colRef"
      v-model:col-setting="colSetting"
    />
  </div>
</template>

<script setup lang="ts" name="ProTable">
import { ElTable } from "element-plus";
import { useTable } from "./hooks/useTable";
import { Refresh, Search, Operation } from "@element-plus/icons-vue";
import { useSelection } from "./hooks/useSelection";
import { ColumnProps, TypeProps, ProTableProps } from "./type";
import { generateUUID, handleProp } from "./utils";
import SearchForm from "./SearchFormV2.vue";
import Pagination from "./PaginationV2.vue";
import ColSetting from "./ColSettingV2.vue";
import TableColumn from "./TableColumnV2.vue";
import "element-plus/es/components/time-picker/style/css";
import "element-plus/es/components/date-picker/style/css";
import "element-plus/es/components/time-select/style/css";
import "element-plus/es/components/cascader/style/css";
import "element-plus/es/components/select-v2/style/css";
import "element-plus/es/components/input-number/style/css";
// 接受父组件参数，配置默认值
const props = withDefaults(defineProps<ProTableProps>(), {
  columns: () => [],
  requestAuto: true,
  pagination: true,
  initParam: {},
  border: true,
  toolButton: true,
  rowKey: "id",
  searchCol: () => ({ xs: 2, sm: 3, md: 4, lg: 5, xl: 6 }),
});
console.log(props, "tableHeight");

// table 实例
const tableRef = ref<InstanceType<typeof ElTable>>();

// 生成组件唯一id
const uuid = ref("id-" + generateUUID());

// column 列类型
const columnTypes: TypeProps[] = [
  "selection",
  "radio",
  "index",
  "expand",
  "sort",
];

// 是否显示搜索模块
const isShowSearch = ref(true);

// 控制 ToolButton 显示
const showToolButton = (key: "refresh" | "setting" | "search") => {
  return Array.isArray(props.toolButton)
    ? props.toolButton.includes(key)
    : props.toolButton;
};

// 单选值
const radio = ref("");

// 表格多选 Hooks
const { selectionChange, selectedList, selectedListIds, isSelected } =
  useSelection(props.rowKey);

// 表格操作 Hooks
const {
  tableData,
  pageable,
  searchParam,
  searchInitParam,
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
} = useTable(
  props.requestApi,
  props.initParam,
  props.pagination,
  props.dataCallback,
  props.searchBefore,
  props.requestError
);

// 清空选中数据列表
const clearSelection = () => tableRef.value!.clearSelection();

// 初始化表格数据 && 拖拽排序
onMounted(() => {
  props.requestAuto && getTableList();
  props.data && (pageable.value.total = props.data.length);
});

// 处理表格数据
const processTableData = computed(() => {
  if (!props.data) return tableData.value;
  if (!props.pagination) return props.data;
  return props.data.slice(
    (pageable.value.page - 1) * pageable.value.limit,
    pageable.value.limit * pageable.value.page
  );
});

// 监听页面 initParam 改化，重新获取表格数据
watch(() => props.initParam, getTableList, { deep: true });

// 接收 columns 并设置为响应式
const tableColumns = computed<ColumnProps[]>(() => {
  return props.columns;
});

// 扁平化 columns
const flatColumns = computed(() => flatColumnsFunc(tableColumns.value));

// 定义 enumMap 存储 enum 值（避免异步请求无法格式化单元格内容 || 无法填充搜索下拉选择）
const enumMap = ref(new Map<string, { [key: string]: any }[]>());
const setEnumMap = async ({ prop, enum: enumValue }: ColumnProps) => {
  if (!enumValue) return;

  // 如果当前 enumMap 存在相同的值 return
  if (
    enumMap.value.has(prop!) &&
    (typeof enumValue === "function" || enumMap.value.get(prop!) === enumValue)
  )
    return;

  // 当前 enum 为静态数据，则直接存储到 enumMap
  if (typeof enumValue !== "function")
    return enumMap.value.set(prop!, unref(enumValue!));

  // 为了防止接口执行慢，而存储慢，导致重复请求，所以预先存储为[]，接口返回后再二次存储
  enumMap.value.set(prop!, []);

  // 当前 enum 为后台数据需要请求数据，则调用该请求接口，并存储到 enumMap
  const { data } = await enumValue();
  enumMap.value.set(prop!, data);
};

// 注入 enumMap
provide("enumMap", enumMap);

// 扁平化 columns 的方法
const flatColumnsFunc = (
  columns: ColumnProps[],
  flatArr: ColumnProps[] = []
) => {
  columns.forEach(async (col) => {
    if (col._children?.length) flatArr.push(...flatColumnsFunc(col._children));
    flatArr.push(col);

    // column 添加默认 isShow && isSetting && isFilterEnum 属性值
    col.isShow = col.isShow ?? true;
    col.isSetting = col.isSetting ?? true;
    col.isFilterEnum = col.isFilterEnum ?? true;

    // 设置 enumMap
    await setEnumMap(col);
  });
  return flatArr.filter((item) => !item._children?.length);
};

// 过滤需要搜索的配置项 && 排序
const searchColumns = computed(() => {
  return flatColumns.value
    ?.filter((item) => item.search?.el || item.search?.render)
    .sort((a, b) => a.search!.order! - b.search!.order!);
});

// 设置 搜索表单默认排序 && 搜索表单项的默认值
searchColumns.value?.forEach((column, index) => {
  column.search!.order = column.search?.order ?? index + 2;
  const key = column.search?.key ?? handleProp(column.prop!);
  const defaultValue = column.search?.defaultValue;
  if (defaultValue !== undefined && defaultValue !== null) {
    searchParam.value[key] = defaultValue;
    searchInitParam.value[key] = defaultValue;
  }
});

// 列设置 ==> 需要过滤掉不需要设置的列
const colRef = ref();
const colSetting = tableColumns.value!.filter((item) => {
  const { type, prop, isSetting } = item;
  return !columnTypes.includes(type!) && prop !== "operation" && isSetting;
});
const openColSetting = () => colRef.value.openColSetting();

// 定义 emit 事件
const emit = defineEmits<{
  search: [];
  reset: [];
  handleCurrentChange: [number];
  handleSizeChange: [number];
}>();

const _search = () => {
  search();
  emit("search");
};

const _reset = () => {
  reset();
  emit("reset");
};

const _handleCurrentChange = (current: number) => {
  handleCurrentChange(current);
  // 触发 page-change 事件
  emit("handleCurrentChange", current);
};

const _handleSizeChange = (size: number) => {
  handleSizeChange(size);
  // 触发 page-change 事件
  emit("handleSizeChange", size);
};

// 暴露给父组件的参数和方法 (外部需要什么，都可以从这里暴露出去)
defineExpose({
  element: tableRef,
  tableData: processTableData,
  radio,
  pageable,
  searchParam,
  searchInitParam,
  isSelected,
  selectedList,
  selectedListIds,

  // 下面为 function
  getTableList,
  search,
  reset,
  handleSizeChange,
  handleCurrentChange,
  clearSelection,
  enumMap,
});
</script>
<style lang="scss" scoped>
@import "./table.scss";
</style>
