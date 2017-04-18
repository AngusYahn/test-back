Vue.use(VueLocalStorage);
Vue.component('modal', {
    template: "#modal-template",
    methods: {
        createUser: function (level) {
            this.$http.post('/user', {level: level}).then(function (response) {
                this.$localStorage.set("userId", response.data);
                this.$emit('close');
                location.reload();
            });
        }
    }
});

new Vue({
    el: '#app',
    localStorage: {
        userId: "hello"
    },
    data: {
        tests: [],
        showModal: false,
        uid: "",
        finishedTests: []
        //showAbilityChoose: false
    },
    mounted: function () {
        this.judgeUser();
        this.fetchTests();
    },
    methods: {
        fetchTests: function () {
            this.$http.get('/tests').then(function (response) {
                this.tests = response.data;
                if (this.finishedTests) {
                    for (i = 0; i < this.tests.length; i++) {
                        this.tests[i].finished = this.finishedTests.indexOf(this.tests[i]._id) != -1;
                    }
                }
            });
        },
        judgeUser: function () {
            //this.$localStorage.remove("userId");
            var me = this.$localStorage.get('userId');
            if (!me) {
                this.showModal = true;
            }
            else {
                this.$http.get('/user/' + me).then(function (response) {
                    var res = response.data;
                    this.uid = res._id;
                    this.finishedTests = res.finishedTests;
                    if (this.tests) {
                        for (i = 0; i < this.tests.length; i++) {
                            this.tests[i].finished = this.finishedTests.indexOf(this.tests[i]._id) != -1;
                        }
                    }

                });
            }

        },
        startTest: function(testIndex){
            var test = this.tests[testIndex];
            console.log(test);
        }
    }
});
