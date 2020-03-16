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
              <el-input v-model.number="ruleForm.code" maxlength="6"></el-input>
            </el-col>
            <el-col :span="9">
              <el-button type="success" class="block">获取验证码</el-button>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item>
          <el-button
            type="primary"
            @click="submitForm('ruleForm')"
            class="login-btn block"
            >登录</el-button
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
export default {
  name: "login",
  data() {
    //验证邮箱
    var validateUserName = (rule, value, callback) => {
      if (value === "") {
        callback(new Error("请输入邮箱"));
      } else if (chekEmail(value)) {
        callback(new Error("邮箱格式有误，请填写正确的邮箱"));
      } else {
        callback();
      }
    };
    //验证密码
    var validatePass = (rule, value, callback) => {
      this.ruleForm.pass = stripscript(value);
      value = this.ruleForm.pass;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (chekPassword(value)) {
        callback(new Error("密码格式有误,应为6-20位的数字和字母的组合"));
      } else {
        callback();
      }
    };
    //验证重复密码
    var validateConfirmPass = (rule, value, callback) => {
      this.ruleForm.confirmPass = stripscript(value);
      value = this.ruleForm.confirmPass;
      if (value === "") {
        callback(new Error("请输入密码"));
      } else if (value != this.ruleForm.pass) {
        callback(new Error("两次密码不一致"));
      } else if (chekPassword(value)) {
        callback(new Error("密码格式有误,应为6-20位的数字和字母的组合"));
      } else {
        callback();
      }
    };
    //验证验证码
    var validateCode = (rule, value, callback) => {
      this.ruleForm.code = stripscript(value);
      value = this.ruleForm.code;
      if (value === "") {
        callback(new Error("验证码不能为空"));
      } else if (chekCode(value)) {
        callback(new Error("验证码错误"));
      } else {
        callback();
      }
    };
    return {
      //登录注册选项卡
      menuTab: [
        { txt: "登录", current: true, type: "login" },
        { txt: "注册", current: false, type: "register" }
      ],
      //模块值
      model: "login",
      ruleForm: {
        username: "",
        pass: "",
        confirmPass: "",
        code: ""
      },
      rules: {
        username: [{ validator: validateUserName, trigger: "blur" }],
        pass: [{ validator: validatePass, trigger: "blur" }],
        confirmPass: [{ validator: validateConfirmPass, trigger: "blur" }],
        code: [{ validator: validateCode, trigger: "blur" }]
      }
    };
  },
  created() {},
  mounted() {},
  methods: {
    toggleMenu(data) {
      this.menuTab.forEach(element => {
        element.current = false;
      });
      data.current = true;
      this.model = data.type;
    },

    submitForm(formName) {
      this.$refs[formName].validate(valid => {
        if (valid) {
          alert("submit!");
        } else {
          console.log("error submit!!");
          return false;
        }
      });
    }
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
