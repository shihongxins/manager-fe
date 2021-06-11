<template>
  <div class="content_wrapper">
    <div class="query_form_wrapper">
      <el-form :inline="true" :model="query" ref="queryForm">
        <el-form-item label="菜单名称" prop="menuName">
          <el-input
            v-model="query.menuName"
            placeholder="请输入菜单名称"
          ></el-input>
        </el-form-item>
        <el-form-item label="菜单状态" prop="menuState">
          <el-select v-model="query.menuState" placeholder="请选择菜单状态">
            <el-option label="停用" :value="0"></el-option>
            <el-option label="正常" :value="1"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleQuerySubmit">查询</el-button>
          <el-button @click="handleQuerySubmit({ reset: true })">
            重置
          </el-button>
        </el-form-item>
      </el-form>
    </div>
    <div class="table_container">
      <div class="table_tools">
        <el-button type="primary" @click="showDialog(true, 'add')">
          新增
        </el-button>
      </div>
      <div class="table_content">
        <el-table
          :data="menuList"
          row-key="_id"
          stripe
        >
          <el-table-column
            v-for="col in tableColumns"
            :key="col.prop"
            :prop="col.prop"
            :label="col.label"
            :formatter="col.formatter"
            :width="col.width"
          ></el-table-column>
          <el-table-column label="操作" width="210px">
            <template #default="scope">
              <el-button
                size="mini"
                type="primary"
                v-if="scope.row.menuType===1"
                @click="showDialog(true, 'add', scope.row)"
              >
                添加
              </el-button>
              <el-button
                size="mini"
                @click="showDialog(true, 'edit', scope.row)"
              >
                编辑
              </el-button>
              <el-button
                size="mini"
                type="danger"
                @click="handleSingleDel(scope.row)"
              >
                删除
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </div>
    <MenuOperateDialog ref="menuOperateDialog" :getMenuList="getMenuList" :menuList="menuList" />
  </div>
</template>

<script>
import {
  getCurrentInstance, onMounted, reactive, ref,
} from 'vue';
import utils from '@/utils/utils';
import MenuOperateDialog from './components/MenuOperateDialog.vue';

/**
 * @param {Object} ctx 页面实例对象
 * @description 菜单数据表格的初始化业务逻辑（包括查询）
 */
const useMenuTableInitEffect = (ctx) => {
  // 表格展示列项
  const tableColumns = [
    {
      label: '菜单名称',
      prop: 'menuName',
    },
    {
      label: '菜单图标',
      prop: 'icon',
    },
    {
      label: '菜单类型',
      prop: 'menuType',
      formatter(row, column, value) {
        const dictionary = {
          1: '页面菜单',
          2: '普通按钮',
        };
        return dictionary[value];
      },
    },
    {
      label: '权限标识',
      prop: 'menuCode',
    },
    {
      label: '路由地址',
      prop: 'path',
    },
    {
      label: '组件路径',
      prop: 'component',
    },
    {
      label: '菜单状态',
      prop: 'menuState',
      formatter(row, column, value) {
        const dictionary = {
          0: '停用',
          1: '正常',
        };
        return dictionary[value];
      },
    },
    {
      label: '创建时间',
      prop: 'createTime',
      formatter(row, column, value) {
        return utils.formatterDateTime(value);
      },
      width: 90,
    },
  ];
  // 表格数据
  const menuList = ref([]);
  // 表格数据查询字段
  const query = reactive({
    menuName: '',
    menuState: 1,
  });
  // 加载表格数据的方法
  const getMenuList = async () => {
    const params = { ...query };
    const list = await ctx.$api.getMenuList(params);
    if (list) {
      menuList.value = list;
    }
  };
  // 查询、重置查询数据方法
  const handleQuerySubmit = (options) => {
    const { reset } = options;
    if (reset) {
      ctx.$refs.queryForm.resetFields();
    }
    getMenuList();
  };
  // （调用子组件的方法）弹出菜单编辑弹窗
  const showDialog = (show, action, menuInfo) => {
    ctx.$refs.menuOperateDialog.handleToggleDialogShow(show, action, menuInfo);
  };
  // 删除一项菜单及其子菜单
  const handleSingleDel = async (row) => {
    if (row && row._id) {
      const res = await ctx.$api.menuOperate({
        _id: row._id,
        menuName: row.menuName,
        action: 'delete',
      });
      if (res === true) {
        ctx.$message.success('删除成功！');
        getMenuList();
      } else {
        ctx.$message.error('删除失败！');
      }
    }
  };
  // 页面初始化的时候自动执行一次加载数据
  onMounted(() => {
    getMenuList();
  });
  return {
    tableColumns,
    menuList,
    query,
    getMenuList,
    handleQuerySubmit,
    showDialog,
    handleSingleDel,
  };
};

export default {
  name: 'Menu',
  components: {
    MenuOperateDialog,
  },
  setup() {
    // 获取页面实例，供其他逻辑使用
    const { ctx } = getCurrentInstance();
    return {
      ...useMenuTableInitEffect(ctx),
    };
  },
};
</script>
