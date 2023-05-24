<template>
  <div>
    <p class="links" v-if="!isSignedIn">
      <button @click="signIn()">Sign In</button>
    </p>
    <div v-if="isSignedIn">
      <p>
        <input type="text" v-model="inputNumber" placeholder="input number">
        <button @click="setNumber()">Set Number to contract</button>
      </p>
      <p>
        <button @click="getNumber()">Get Number from contract</button> Number: {{number}}
      </p>
    </div>
  </div>
</template>


<script>
import {initializeApp,getApps} from 'firebase/app'
import {GoogleAuthProvider,signInWithRedirect,getRedirectResult,getAuth} from 'firebase/auth'
import sha256 from "js-sha256"; //←追加
import toContract from "~/plugins/toContract.js"; //←追加
export default {
  data() {
    return {
      number: 0, // コントラクトから取得する数値
      inputNumber: 0, // フォームから入力された数値
      isSignedIn: false,
      pk:"",
      address: "",


    }
  },
  methods: {
    getNumber: async function() {
      let ret = await this.$contract.methods.get().call();
      console.log((typeof ret));
      this.number = parseInt(ret,10);
      console.log((typeof this.number));
    },
    setNumber: async function() {
      const functionAbi = await this.$contract.methods
        .set(this.inputNumber)
        .encodeABI();
      let result = await toContract(
        this,
        this.address,
        this.privateKey,
        functionAbi
      );
      console.log("hello world");
    },
    signIn: function() {
      const auth = getAuth();
      signInWithRedirect(auth,new GoogleAuthProvider());
    }
  },
  name: 'IndexPage',
  mounted() {
    if (!getApps().length) {
      var firebaseConfig = {
        apiKey: process.env.APIKEY,
        authDomain: process.env.AUTHDOMAIN, };
// Initialize Firebase
      initializeApp(firebaseConfig);
    }
    var self = this;
    const auth = getAuth();
    getRedirectResult(auth)
      .then((result) => {
        if (GoogleAuthProvider.credential(result)) {
          const user = result.user;
          self.isSignedIn = true;
          console.log(user.uid);
          self.privateKey = "0x" + sha256.hex(user.uid);
          self.address = self.$web3.eth.accounts.privateKeyToAccount(self.privateKey).address;
          self.$web3.eth.accounts.wallet.add(self.privateKey);
          self.$web3.eth.defaultAccount = self.address;
          console.log("Address:" + self.address);
        }


      })
      .catch((error) => {
        console.log(error);
      });
    console.log("Current Block Number");
    this.$web3.eth.getBlockNumber().then(console.log);
  }


};
</script>
