<template>
  <el-dialog v-model="dialogData.showDialog" :title="dialogData.title">
    <el-form
      :model="dialogData"
      :rules="dialogDataRules"
      ref="operateForm"
      label-position="right"
      label-width="6em"
    >
      <!-- 新增与编辑（roleName, remark） -->
      <el-form-item label="角色名称" prop="roleName">
        <el-input
          v-model="dialogData.roleName"
          placeholder="请输入角色名称"
          autocomplete="off"
          :disabled="dialogData.action === 'setPermission'"
        ></el-input>
      </el-form-item>
      <el-form-item
        label="备注"
        prop="remark"
        v-show="dialogData.action != 'setPermission'"
      >
        <el-input
          type="textarea"
          v-model="dialogData.remark"
          placeholder="请输入备注信息"
          autocomplete="off"
        ></el-input>
      </el-form-item>
      <template v-if="dialogData.action === 'setPermission'">
        <!-- 权限设置 -->
        <el-divider></el-divider>
        <el-form-item label="选择权限" prop="checkedBtns">
          <el-tree
            ref="menuTree"
            show-checkbox
            default-expand-all
            node-key="_id"
            :data="menuList"
            :props="{ children: 'children', label: 'menuName' }"
          ></el-tree>
        </el-form-item>
      </template>
    </el-form>
    <template #footer>
      <el-button @click="handleToggleDialogShow(false)">取 消</el-button>
      <el-button type="primary" @click="handleSubmitRoleOperate"
        >确 定</el-button
      >
    </template>
  </el-dialog>
</template>

<script>
import {
  getCurrentInstance, reactive, toRaw,
} from 'vue';

/**
 * @param {Object} ctx 页面实例对象
 * @param {Function} getRoleList 重新加载页面表格数据的方法
 * @description 新增、编辑角色数据的业务逻辑（弹窗）
 */
const useRoleOperateEffect = (ctx, getRoleList) => {
  // 弹窗与弹窗表单的数据
  const dialogData = reactive({
    // 下面是弹窗的表单数据
    _id: '',
    roleName: '',
    remark: '',
    checkedPages: [],
    checkedBtns: [],
    // 下面是弹窗的属性数据
    action: 'add', // add: 新增, edit: 编辑, setPermission 设置权限
    title: '新增角色',
    showDialog: false, // true 展示, false 隐藏
  });
  // 弹窗表单的数据校验规则
  const dialogDataRules = {
    roleName: { trigger: 'blur', required: true, message: '请输入角色名称' },
  };
  // 弹窗的显隐状态切换方法
  const handleToggleDialogShow = (show, action, roleInfo) => {
    // action 必须为新增或编辑，才能显示表单
    // ❗❗❗❗❗ 在显示之前不要修改任何除弹窗显示之外的任何 dialogData 字段，否则无法重置表单
    if (action) {
      dialogData.action = action;
    }
    if (action === 'edit') {
      dialogData.title = '编辑角色';
    } else if (action === 'add') {
      dialogData.title = '新增角色';
    } else if (action === 'setPermission') {
      dialogData.title = '设置权限';
    }
    // 改变弹窗显示状态
    dialogData.showDialog = show;
    // ❗❗❗❗弹窗改变结束并操作完 DOM 后，再才执行下面的任务
    ctx.$nextTick(() => {
      // 清空弹窗的表单 在显示之前不要修改任何除弹窗显示之外的任何 dialogData 字段，否则无法重置表单
      ctx.$refs.operateForm.resetFields();
      if (
        roleInfo !== undefined
        && (action === 'edit' || action === 'setPermission')
      ) {
        // 如果是编辑角色，还需填入其他信息
        dialogData._id = roleInfo._id;
        dialogData.roleName = roleInfo.roleName;
        dialogData.remark = roleInfo.remark;
        // 设置权限，加载权限列表，并初始化选择
        if (action === 'setPermission') {
          if (roleInfo.rolePermission) {
            const { checkedPages, checkedBtns } = roleInfo.rolePermission;
            dialogData.checkedPages = checkedPages;
            dialogData.checkedBtns = checkedBtns;
          }
          ctx.$refs.menuTree.setCheckedKeys(dialogData.checkedBtns);
        }
      }
    });
  };
  // 弹窗表单数据的提交
  const handleSubmitRoleOperate = () => {
    // 提交前 校验表单
    ctx.$refs.operateForm.validate(async (valid) => {
      if (valid) {
        // 手动修改数据的时候一定得转为非响应式对象然后拷贝一份，避免影响原始响应式数据
        const roleInfo = toRaw(dialogData);
        if (roleInfo.action !== 'setPermission') {
          delete roleInfo.checkedPages;
          delete roleInfo.checkedBtns;
        } else {
          const allCheckedMenu = ctx.$refs.menuTree.getCheckedNodes();
          const checkedPages = [];
          const checkedBtns = [];
          allCheckedMenu.forEach((item) => {
            if (item) {
              // 选中的页面
              if (
                item.menuType === 1
                && item.children
                && item.children.length
                && item.children[0].menuType === 2
              ) {
                checkedPages.push(item._id);
              }
              // 选中的按钮
              if (item.menuType === 2) {
                checkedBtns.push(item._id);
              }
            }
          });
          roleInfo.rolePermission = { checkedPages, checkedBtns };
        }
        const res = await ctx.$api.roleOperate(roleInfo);
        if (res === true) {
          // 关闭弹窗
          handleToggleDialogShow(false);
          // 重新加载表格
          getRoleList();
          // 弹出提示
          ctx.$message.success(
            `${dialogData.title} -> [${roleInfo.roleName}] 成功！`,
          );
        } else {
          ctx.$message.warning(
            `${dialogData.title} -> [${roleInfo.roleName}] 失败！`,
          );
        }
      }
    });
  };
  // 返回业务逻辑给 setup
  return {
    dialogData,
    dialogDataRules,
    handleToggleDialogShow,
    handleSubmitRoleOperate,
  };
};

export default {
  name: 'RoleOperateDialog',
  props: {
    getRoleList: {
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
      ...useRoleOperateEffect(ctx, props.getRoleList),
    };
  },
};
</script>
