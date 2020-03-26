<template>
  <div id="login">
    <div class="login-warp">
      <ul class="menu-tab">
        <li
          :class="{ current: item.current }"
          v-for="item in menuTab"
          :key="item.id"
          @click="toggleMenu(item)"
        >
          {{ item.txt }}
        </li>
      </ul>
      <el-form
        :model="ruleForm"
        status-icon
        :rules="rules"
        ref="ruleForm"
        class="login-form"
      >
        <el-form-item prop="username">
          <label>邮箱</label>
          <el-input
            type="text"
            v-model="ruleForm.username"
            autocomplete="off"
          ></el-input>
        </el-form-item>

        <el-form-item prop="pass">
          <label>密码</label>
          <el-input
            type="password"
            v-model="ruleForm.pass"
            autocomplete="off"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item prop="confirmPass" v-if="model === 'register'">
          <label>确认密码</label>
          <el-input
            type="password"
            v-model="ruleForm.confirmPass"
            autocomplete="off"
            maxlength="20"
          ></el-input>
        </el-form-item>

        <el-form-item prop="code">
          <label>验证码</label>
          <el-row :gutter="10">
            <el-col :span="15">
              <el-input v-model="ruleForm.code" maxlength="6"></el-input>
            </el-col>
            <el-col :span="9">
              <el-button
                type="success"
                class="block"
                @click="getSms()"
                :disabled="codeBtn.status"
                >{{ codeBtn.text }}</el-button
              >
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm('ruleForm')"
            class="login-btn block"
            :disabled="loginBtnStatus"
            >{{ model === "login" ? "登录" : "注册" }}</el-button
          >
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script>
import {
  stripscript,
  chekEmail,
  chekPassword,
  chekCode
} from "@/utils/validate";
import { reactive, ref, isRef, onMounted } from "@vue/composition-api";
import { GetSms, Register, Login } from "@/api/login";
import sha1 from "js-sha1";
export default {
  name: "login",
  /*
    attrs:(...) == this.$attrs
    emit:(...) == this.$emit
    listeners:(...) == this.$listeners
    parent:(...) == this.$parent
    refs:(...) == this.$refs
    root:(...) == this
   */
  setup(props, context) {
    //验证邮箱
    let validateUserName = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入邮箱"));
      } else if (chekEmail(value)) {
        callback(new Error("邮箱格式有误，请填写正确的邮箱"));
      } else {
        callback();
      }
    };
    //验证密码
    let validatePass = (rule, value, callback) => {
      ruleForm.pass = stripscript(value);
      value = ruleForm.pass;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (chekPassword(value)) {
        callback(new Error("密码格式有误,应为6-20位的数字和字母的组合"));
      } else {
        callback();
      }
    };
    //验证重复密码
    let validateConfirmPass = (rule, value, callback) => {
      ruleForm.confirmPass = stripscript(value);
      value = ruleForm.confirmPass;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (value != ruleForm.pass) {
        callback(new Error("两次密码不一致"));
      } else if (chekPassword(value)) {
        callback(new Error("密码格式有误,应为6-20位的数字和字母的组合"));
      } else {
        callback();
      }
    };
    //验证验证码
    let validateCode = (rule, value, callback) => {
      ruleForm.code = stripscript(value);
      value = ruleForm.code;

      if (value === "") {
        callback(new Error("验证码不能为空"));
      } else if (chekCode(value)) {
        callback(new Error("验证码错误"));
      } else {
        callback();
      }
    };

    /*
     ***********************************************声明数据*********************************************
     */
    //登录注册选项卡
    const menuTab = reactive([
      { txt: "登录", current: true, type: "login" },
      { txt: "注册", current: false, type: "register" }
    ]);
    //切换模块
    const model = ref("login");
    //登录按钮状态
    const loginBtnStatus = ref(true);
    //获取验证码按钮的显示及状态
    const codeBtn = reactive({
      text: "获取验证码",
      status: false
    });
    //倒计时器
    const countDownTimer = ref(null);
    //表单绑定数据
    const ruleForm = reactive({
      username: "",
      pass: "",
      confirmPass: "",
      code: ""
    });
    //表单验证
    const rules = reactive({
      username: [{ validator: validateUserName, trigger: "blur" }],
      pass: [{ validator: validatePass, trigger: "blur" }],
      confirmPass: [{ validator: validateConfirmPass, trigger: "blur" }],
      code: [{ validator: validateCode, trigger: "blur" }]
    });
    /*
     ***********************************************声明函数*********************************************
     */

    //切换菜单
    const toggleMenu = data => {
      menuTab.forEach(element => {
        element.current = false;
      });
      data.current = true;
      model.value = data.type;
      //清空表单数据
      context.refs["ruleForm"].resetFields();
      clearCountDown();
    };

    //获取验证码
    const getSms = () => {
      if (ruleForm.username == "") {
        context.root.$message.error("亲,邮箱不能为空噢！");
        return false;
      }
      if (chekEmail(ruleForm.username)) {
        context.root.$message.error("亲,邮箱格式不对噢！");
        return false;
      }
      changeCodeBtn(true, "发送中");
      let requestData = {
        username: ruleForm.username,
        module: model.value
      };
      setTimeout(() => {
        loginBtnStatus.value = false;
        GetSms(requestData)
          .then(result => {
            let data = result.data;
            //弹出成功提示框
            context.root.$message({
              message: data.message,
              type: "success"
            });
            countDown(60);
          })
          .catch(err => {
            console.log(err);
          });
      }, 3000);
    };
    //倒计时
    const countDown = number => {
      let times = number;
      countDownTimer.value = setInterval(() => {
        times--;
        codeBtn.text = `重新发送(${times})`;
        if (times === 0) {
          clearInterval(countDownTimer.value);
          changeCodeBtn(false, "重新发送");
        }
      }, 1000);
    };
    //清除倒计时
    const clearCountDown = () => {
      //还原按钮默认事件
      changeCodeBtn(false, "获取验证码");
      //清除定时器
      clearInterval(countDownTimer.value);
    };
    //更改获取验证码按钮状态
    const changeCodeBtn = (status, text) => {
      codeBtn.status = status;
      codeBtn.text = text;
    };
    //登录方法
    const login = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.pass),
        code: ruleForm.code
      };
      Login(requestData)
        .then(result => {
          let data = result.data;
          context.root.$message({
            message: data.message,
            type: "success"
          });
        })
        .catch(err => {
          console.log(err);
        });
    };
    //注册方法
    const register = () => {
      let requestData = {
        username: ruleForm.username,
        password: sha1(ruleForm.pass),
        code: ruleForm.code
      };
      let loginUsername = ruleForm.username;
      Register(requestData)
        .then(result => {
          let data = result.data;
          context.root.$message({
            message: data.message,
            type: "success"
          });
          //跳转到登录页面
          toggleMenu(menuTab[0]);
          //清除倒计时
          clearCountDown();
          //
          ruleForm.username = loginUsername;
        })
        .catch(err => {
          console.log(err);
        });
    };
    //提交表单
    const submitForm = formName => {
      context.refs[formName].validate(valid => {
        if (valid) {
          if (model.value === "login") {
            login();
          } else {
            register();
          }
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    };
    //挂载完执行的函数
    onMounted(() => {
      console.log(process.env.VUE_APP_TEST);
    });

    return {
      menuTab,
      model,
      loginBtnStatus,
      codeBtn,
      countDownTimer,
      ruleForm,
      rules,
      toggleMenu,
      getSms,
      submitForm
    };
  }
};
</script>

<style lang="scss" scoped>
#login {
  height: 100%;
  width: 100%;
  position: absolute;
  background-color: #344a5f;
}
.login-warp {
  width: 330px;
  margin: 0 auto;
}
.menu-tab {
  text-align: center;
  li {
    display: inline-block;
    width: 88px;
    line-height: 36px;
    color: #f5f6f6;
    border-radius: 2px;
    cursor: pointer;
  }
  .current {
    background-color: rgba(0, 0, 0, 0.1);
  }
}
.login-form {
  margin-top: 14px;
  label {
    display: block;
    margin-bottom: 1px;
    color: #ffff;
    margin-top: 13px;
  }
  .login-btn {
    margin-top: 32px;
  }
  .block {
    display: block;
    width: 100%;
  }
}
</style>
