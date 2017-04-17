/**
 * Created by jihongfei on 4/16/17.
 */

new Vue({
    el: "#app",
    data: {
        addReady: true,
        test: "",
        password: "",
        response: ""
    },
    mounted: function(){

    },
    methods: {
        addTest: function(){
            submitText = this._data.password + "//" + this._data.test;
            console.log(submitText);
            this.$http.post('http://localhost:5000/tests', submitText).then(function(response) {
                this.addReady = false;
                this.test = "";
                this.response = response.data;
            });
        }
    }
});