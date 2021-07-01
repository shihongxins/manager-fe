var e=Object.defineProperty,a=Object.getOwnPropertySymbols,l=Object.prototype.hasOwnProperty,t=Object.prototype.propertyIsEnumerable,o=(a,l,t)=>l in a?e(a,l,{enumerable:!0,configurable:!0,writable:!0,value:t}):a[l]=t;import{u as r}from"./index.2f2dbab9.js";import{s as d,B as i,z as n,r as u,o as s,c as p,w as g,a as m,F as c,d as v,b as f}from"./vendor.9586058d.js";const D={name:"ApplyLeaveDialog",props:{getLeaveList:{required:!0,type:Function},leaveTypeList:{required:!0,type:Array}},setup(e){const{ctx:u}=n();return((e,r)=>{for(var d in r||(r={}))l.call(r,d)&&o(e,d,r[d]);if(a)for(var d of a(r))t.call(r,d)&&o(e,d,r[d]);return e})({},((e,a)=>{const l=d({leaveType:"",leaveDate:[],leaveLength:0,reason:"",showDialog:!1,action:"add",title:"提价申请休假"}),t=a=>{l.showDialog=a,e.$nextTick((()=>{e.$refs.operateForm.resetFields()}))};return{dialogData:l,dialogDataRules:{leaveType:{trigger:"blur",required:!0,message:"请选择休假类型"},leaveDate:{trigger:"blur",required:!0,message:"请选择休假日期"},leaveLength:{trigger:"blur",required:!0,message:"请确认休假时长"},reason:{trigger:"blur",required:!0,message:"请输入休假原因"}},calculateLeaveLength:()=>{let e=0;try{e=(l.leaveDate[1]||0)-(l.leaveDate[0]||0),e&&(e/=864e5,e=Math.ceil(e))}catch(a){e=0}l.leaveLength=e},handleToggleDialogShow:t,handleSubmitApplyLeave:()=>{e.$refs.operateForm.validate((async o=>{if(o){const o=i(l);o.leaveDate.forEach(((e,a)=>{o.leaveDate[a]=r.formatterDateTime(e)})),!0===await e.$api.leaveOperate(o)?(t(!1),a(),e.$message.success("提交申请休假成功！")):e.$message.warning("提交申请休假失败")}}))}}})(u,e.getLeaveList))}},h=f("天"),b=f("取 消"),y=f("确 定");D.render=function(e,a,l,t,o,r){const d=u("el-option"),i=u("el-select"),n=u("el-form-item"),f=u("el-date-picker"),D=u("el-input"),L=u("el-form"),w=u("el-button"),V=u("el-dialog");return s(),p(V,{modelValue:e.dialogData.showDialog,"onUpdate:modelValue":a[6]||(a[6]=a=>e.dialogData.showDialog=a),title:"新增申请休假"},{footer:g((()=>[m(w,{onClick:a[5]||(a[5]=a=>e.handleToggleDialogShow(!1))},{default:g((()=>[b])),_:1}),m(w,{type:"primary",onClick:e.handleSubmitApplyLeave},{default:g((()=>[y])),_:1},8,["onClick"])])),default:g((()=>[m(L,{model:e.dialogData,rules:e.dialogDataRules,ref:"operateForm","label-position":"right","label-width":"6em"},{default:g((()=>[m(n,{label:"休假类型",prop:"leaveType"},{default:g((()=>[m(i,{modelValue:e.dialogData.leaveType,"onUpdate:modelValue":a[1]||(a[1]=a=>e.dialogData.leaveType=a),placeholder:"请选择休假类型"},{default:g((()=>[(s(!0),p(c,null,v(l.leaveTypeList,(e=>(s(),p(d,{key:e.value,value:e.value,label:e.label},null,8,["value","label"])))),128))])),_:1},8,["modelValue"])])),_:1}),m(n,{label:"休假时间",prop:"leaveDate"},{default:g((()=>[m(f,{size:"mini",modelValue:e.dialogData.leaveDate,"onUpdate:modelValue":a[2]||(a[2]=a=>e.dialogData.leaveDate=a),type:"datetimerange","range-separator":"至","start-placeholder":"开始日期","end-placeholder":"结束日期","default-time":[new Date(2e3,1,1,9,0,0),new Date(2e3,1,1,17,0,0)],onChange:e.calculateLeaveLength},null,8,["modelValue","default-time","onChange"])])),_:1}),m(n,{label:"休假时长",prop:"leaveLength"},{default:g((()=>[m(D,{modelValue:e.dialogData.leaveLength,"onUpdate:modelValue":a[3]||(a[3]=a=>e.dialogData.leaveLength=a),placeholder:"请确认休假时长",autocomplete:"off"},{append:g((()=>[h])),_:1},8,["modelValue"])])),_:1}),m(n,{label:"休假原因",prop:"reason"},{default:g((()=>[m(D,{type:"textarea",modelValue:e.dialogData.reason,"onUpdate:modelValue":a[4]||(a[4]=a=>e.dialogData.reason=a),placeholder:"请输入休假原因",autocomplete:"off"},null,8,["modelValue"])])),_:1})])),_:1},8,["model","rules"])])),_:1},8,["modelValue"])};export default D;
