import Vue from "vue";
import VueRouter from "vue-router";
import Login from "../views/Login/index.vue";
Vue.use(VueRouter);

const routes = [
  {
    path: "/",
    redirect: "login" //路由的重定向redirect
  },
  {
    path: "/login",
    name: "Login",
    component: Login
  },
  {
    path: "/register",
    name: "Register",
    component: () => import("../views/Register/index.vue")
  }
];

const router = new VueRouter({
  routes
});

export default router;
