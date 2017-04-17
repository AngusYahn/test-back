import datetime
import config as cfg


def add_test(test_str):
    test_questions = test_str.split("\n\n")

    # init test
    test_doc = dict()
    today = datetime.datetime.now()
    today = today.strftime("%Y-%m-%d %H:%M:%S")
    test_doc["createTime"] = today
    test_doc["updateTime"] = today
    test_doc["questionAmount"] = len(test_questions)
    test_doc["questions"] = list()

    # single questions
    for q in test_questions:
        question_doc = dict()
        segments = q.split("\n")
        correct_ind = int(segments[0]) - 1
        question_doc["oriIndex"] = len(test_doc["questions"])
        question_doc["passage"] = segments[1]
        question_doc["question"] = segments[2]
        question_doc["choices"] = list()
        for choice in segments[3:]:
            # avoid empty string
            if len(choice) == 0:
                continue
            choice_doc = dict()
            choice_doc["oriIndex"] = len(question_doc["choices"])
            choice_doc["isCorrect"] = False
            if choice_doc["oriIndex"] == correct_ind:
                choice_doc["isCorrect"] = True
            choice_doc["content"] = choice
            question_doc["choices"].append(choice_doc)

        test_doc["questions"].append(question_doc)

    cfg.tests.insert_one(test_doc)

    return 1
