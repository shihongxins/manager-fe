<template>
  <el-dialog v-model="dialogData.showDialog" :title="dialogData.title">
    <el-form
      :model="dialogData"
      :rules="dialogDataRules"
      ref="operateForm"
      label-position="right"
      label-width="6em"
    >
      <el-form-item label="父级菜单" prop="parentId">
        <el-cascader
          v-model="dialogData.parentId"
          :options="menuList"
          :props="{
            label: 'menuName',
            value: '_id',
            checkStrictly: true,
            expandTrigger: 'hover',
          }"
          placeholder="请选择父级菜单"
          clearable
        ></el-cascader>
        <span>留空，则默认创建一级菜单</span>
      </el-form-item>
      <el-form-item label="菜单类型" prop="menuType">
        <el-radio-group v-model="dialogData.menuType">
          <el-radio :label="1">页面菜单</el-radio>
          <el-radio :label="2">普通按钮</el-radio>
        </el-radio-group>
      </el-form-item>
      <el-form-item label="菜单名称" prop="menuName">
        <el-input
          v-model="dialogData.menuName"
          placeholder="请输入菜单名称"
          autocomplete="off"
        ></el-input>
      </el-form-item>
      <template v-if="dialogData.menuType===1">
        <el-form-item label="菜单图标" prop="icon">
          <el-input
            v-model="dialogData.icon"
            placeholder="请输入菜单图标"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="路由地址" prop="path">
          <el-input
            v-model="dialogData.path"
            placeholder="请输入菜单跳转的路由地址"
            autocomplete="off"
          ></el-input>
        </el-form-item>
        <el-form-item label="组件路径" prop="component">
          <el-input
            v-model="dialogData.component"
            placeholder="请输入菜单跳转的组件路径"
            autocomplete="off"
          ></el-input>
        </el-form-item>
      </template>
      <el-form-item v-else-if="dialogData.menuType===2" label="权限标识" prop="menuCode">
        <el-input
          v-model="dialogData.menuCode"
          placeholder="请输入按钮权限标识"
          autocomplete="off"
        ></el-input>
      </el-form-item>
      <el-form-item label="菜单状态" prop="menuState">
        <el-radio-group v-model="dialogData.menuState">
          <el-radio :label="0">停用</el-radio>
          <el-radio :label="1">启用</el-radio>
        </el-radio-group>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="handleToggleDialogShow(false)">取 消</el-button>
      <el-button type="primary" @click="handleSubmitMenuOperate"
        >确 定</el-button
      >
    </template>
  </el-dialog>
</template>

<script>
import { getCurrentInstance, reactive, toRaw } from 'vue';

/**
 * @param {Object} ctx 页面实例对象
 * @param {Function} getMenuList 重新加载页面表格数据的方法
 * @description 新增、编辑菜单数据的业务逻辑（弹窗）
 */
const useMenuOperateEffect = (ctx, getMenuList) => {
  // 弹窗与弹窗表单的数据
  const dialogData = reactive({
    // 下面是弹窗的表单数据
    parentId: [],
    menuType: 1,
    menuName: '',
    icon: '',
    path: '',
    compoent: '',
    menuState: 1,
    menuCode: '',
    // 下面是弹窗的属性数据
    action: 'add', // add: 新增, edit: 编辑
    title: '新增菜单',
    showDialog: false, // true 展示, false 隐藏
  });
  // 弹窗表单的数据校验规则
  const dialogDataRules = {
    menuName: { trigger: 'blur', required: true, message: '请输入菜单名称' },
  };
  // 弹窗的显隐状态切换方法
  const handleToggleDialogShow = (show, action, menuInfo) => {
    // action 必须为新增或编辑，才能显示表单
    if (action === 'add' || action === 'edit') {
      dialogData.action = action;
      if (action === 'edit') {
        dialogData.title = '编辑菜单';
      } else if (action === 'add') {
        if (menuInfo) {
          dialogData.title = '添加菜单';
        } else {
          dialogData.title = '新增菜单';
        }
      }
    }
    // 改变弹窗显示状态
    dialogData.showDialog = show;
    // ❗❗❗❗弹窗改变结束并操作完 DOM 后，再才执行下面的任务
    ctx.$nextTick(() => {
      // 清空弹窗的表单
      ctx.$refs.operateForm.resetFields();
      if (menuInfo !== undefined) {
        // 如果是添加菜单，那么父级菜单为 当前菜单的父级 加上 当前菜单
        if (action === 'add') {
          dialogData.parentId = [...menuInfo.parentId, menuInfo._id].filter((item) => item);
        }
        // 如果是编辑菜单，那么父级菜单不用修改，还需填入其他信息
        if (action === 'edit') {
          dialogData._id = menuInfo._id;
          dialogData.parentId = menuInfo.parentId.filter((item) => item);
          dialogData.menuType = menuInfo.menuType;
          dialogData.menuName = menuInfo.menuName;
          dialogData.icon = menuInfo.icon;
          dialogData.path = menuInfo.path;
          dialogData.compoent = menuInfo.compoent;
          dialogData.menuState = menuInfo.menuState;
          dialogData.menuCode = menuInfo.menuCode;
        }
      }
    });
  };
  // 弹窗表单数据的提交
  const handleSubmitMenuOperate = () => {
    // 提交前 校验表单
    ctx.$refs.operateForm.validate(async (valid) => {
      if (valid) {
        // 手动修改数据的时候一定得转为非响应式对象然后拷贝一份，避免影响原始响应式数据
        const menuInfo = toRaw(dialogData);
        const res = await ctx.$api.menuOperate(menuInfo);
        if (res === true) {
          // 关闭弹窗
          handleToggleDialogShow(false);
          // 重新加载表格
          getMenuList();
          // 弹出提示
          ctx.$message.success(`${dialogData.title} -> [${menuInfo.menuName}] 成功！`);
        } else {
          ctx.$message.warning(`${dialogData.title} -> [${menuInfo.menuName}] 失败！`);
        }
      }
    });
  };
  // 返回业务逻辑给 setup
  return {
    dialogData,
    dialogDataRules,
    handleToggleDialogShow,
    handleSubmitMenuOperate,
  };
};

export default {
  name: 'MenuOperateDialog',
  props: {
    getMenuList: {
      required: true,
      type: Function,
    },
    menuList: {
      type: Array,
      default: () => [],
    },
  },
  setup(props) {
    const { ctx } = getCurrentInstance();
    return {
      ...useMenuOperateEffect(ctx, props.getMenuList),
    };
  },
};
</script>
