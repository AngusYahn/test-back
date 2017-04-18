function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}

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
        userId: "hello",
        test: Object
    },
    data: {
        tests: [],
        test: null,
        questionIndex: 0,
        showModal: false,
        uid: "",
        finishedTests: [],
        showTest: false,
        curQuestion: null,
        userChoiceIndex: -1,
        userChoiceRandomIndex: -1,
        questionLog: [],
        startTimeStamp: 0,
        finishTimeStamp: 0,
        correctItems: 0,
        testFinished: false,
        testStartDate: null,
        showScore: false,
        scoreSuccess: false
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
            this.test = test;
            this.test.questions = shuffle(this.test.questions);
            this.nextQuestion();
            this.showTest = true;
            this.testStartDate = new Date();

        },
        nextQuestion: function(){
            var thisQuestion = this.test.questions[this.questionIndex];
            thisQuestion.isFinished = false;
            this.questionIndex++;
            if (this.questionIndex == this.test.questions.length) {
                thisQuestion.isFinished = true;
            }
            thisQuestion.choices = shuffle(thisQuestion.choices);
            this.curQuestion = thisQuestion;
            this.startTimeStamp = Date.now();
            this.userChoiceRandomIndex = -1;
        },
        chooseAnswer: function(oriIndex, index){
            this.userChoiceIndex = oriIndex;
            this.userChoiceRandomIndex = index;
        },
        submitQuestion: function(){
            this.finishTimeStamp = Date.now();
            var thisLog = {
                questionIndex: this.curQuestion.oriIndex,
                chooseIndex: this.userChoiceIndex,
                duration: this.finishTimeStamp - this.startTimeStamp,
                correct: this.curQuestion.choices[this.userChoiceRandomIndex].isCorrect
            };
            if (thisLog.correct){
                this.correctItems++;
            }
            this.questionLog.push(thisLog);
            this.nextQuestion();
        },
        finishTest: function(){
            this.finishTimeStamp = Date.now();
            var thisLog = {
                questionIndex: this.curQuestion.oriIndex,
                chooseIndex: this.userChoiceIndex,
                duration: this.finishTimeStamp - this.startTimeStamp,
                correct: this.curQuestion.choices[this.userChoiceRandomIndex].isCorrect
            };
            if (thisLog.correct){
                this.correctItems++;
            }
            this.questionLog.push(thisLog);
            var log = {
                uid: this.uid,
                testId: this.test._id,
                totalQuestions: this.test.questionAmount,
                correctQuestions: this.correctItems,
                questionLog: this.questionLog,
                startDate: this.testStartDate
            };
            this.$http.post('/log', log).then(function(response){
                this.scoreSuccess = true;
            });
            this.showScore = true;

        }
    }
});
