<template>
<div class="col-lg-6 offset-lg-3 col-md-8 offset-md-2">
<form class="card mt-5" data-testid="form-sign-up" v-if="!signupSuccess">
  <div class="card-header">
    <h1 class="text-center">Sign Up</h1>
  </div>
  <div class="card-body">
    <!-- <div class="mb-3">
    <label for="username" class="form-label">Username</label>
  <input  id="username" v-model="username" class="form-control"/>
  <span>{{errors.username}}</span>
    </div> -->
  <Input id="username" label="Username" :help="errors.username" @custom-input="onChangeUsername" v-model="username" />
  <!-- <div class="mb-3">
  <label for="email" class="form-label">Email</label>
  <input id="email" v-model="email" class="form-control"/>
  </div> -->
  <Input id="email" label="Email" :help="errors.email" v-model="email" />

  <div class="mb-3">
   <label for="password" class="form-label">Password</label>
  <input id="password" type="password" v-model="password" class="form-control" />
  </div>

  <div class="mb-3">
  <label for="password-repeat" class="form-label">Confirm Password</label>
  <input id="password-repeat" type="password" v-model="confirmPassword" class="form-control"/>
  </div>
  <div class="text-center">
    <button :disabled="isDisabled || apiProgress" @click.prevent="submit" class="btn btn-primary"><span class="spinner-border spinner-border-sm" role="status" v-if="apiProgress" ></span>Sign Up</button>
  </div>
  </div>
  </form>
  <div class="alert alert-success text-center mt-3" v-else>Please check your email to activate your account</div>
</div>
</template>

<script>
import axios from "axios";
import Input from "../components/Input";
export default {
  name: 'SignUpPage',
  components: {
    Input
  },
  data(){
    return{
      disabled: false,
      username: '',
      email: '',
      password:'',
      confirmPassword: '',
     apiProgress: false,
      signupSuccess: false,
      errors: {}
    }
  },
  methods: {
    submit(){
 
      this.apiProgress = true;
      axios.post("/api/1.0/users", {
        username: this.username,
        email: this.email,
        password: this.password
      }).then(() => {
      this.signupSuccess = true;
      this.apiProgress = false;
      }).catch((e) => {
        if(e.response.status === 400){
          this.errors = e.response.data.validationErrors
          
        }
        this.apiProgress = false;
 
      });
     
    },
 
  },
  computed: {
    isDisabled(){
     return this.password && this.confirmPassword ? this.password !== this.confirmPassword : true
    }
  }
}
</script>
<style scoped>


</style>