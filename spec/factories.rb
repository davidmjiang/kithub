FactoryGirl.define do

  factory :teacher do

    sequence(:email) do |n|
      "abcde#{n}@abcd.com"
    end

    password "password"
    first_name "adrian"
    last_name "mui"

  end

  factory :course do
    title "History of the Dark Arts"
    teacher

    trait :without_title do
      title nil
    end
  end

  factory :assignment do
    title "Dark Arts Final"
    assignment_type "Test"
    possible_score 100
    course

    trait :without_title do
      title nil
    end
  end

  factory :student do
    sequence(:email) do |n|
      "xyz#{n}@abcd.com"
    end

    first_name "adrian"
    last_name "mui"

    trait :without_email do
      email nil
    end
  end

  factory :submission do
    raw_score 100
    real_score 100
    student
    assignment
  end


  factory :lesson_plan do
    title "Tom's Plan"
    content "This is very good"
    hours 1.5
    version 1.0
    teacher

    trait :without_title do
      title nil
    end

    trait :short_title do
      title 'l'
    end

    trait :long_title do
      title ("a" * 300)
    end

    trait :other_version do
      version 1.1
    end

    trait :new_lesson do
      title "Phil's Lesson"
      content "Do or do not."
      hours 2.0
      version 1.2
    end
  end


  factory :pull_request do
    title "hashtag"
    description "funny description"
    association :parent_plan, factory: :lesson_plan
    association :forked_plan, factory: [ :lesson_plan, :other_version ]
    status "unmerged"
    accept_reject_time nil

    trait :no_parent_plan do
      parent_plan nil
    end

    trait :no_forked_plan do
      forked_plan nil
    end
  end

  factory :lesson_plan_contributor do
    association :teacher, factory: :teacher
    association :lesson_plan, factory: :lesson_plan
  end

  factory :lesson_plan_star do
    association :teacher, factory: :teacher
    association :lesson_plan, factory: :lesson_plan
  end

  factory :teacher_following do
    association :follower
    association :followed
  end

  factory :flat_curve do 
    flat_rate 12
    assignment

    trait :without_rate do 
      flat_rate nil
    end

    trait :with_high_rate do 
      flat_rate 120
    end

    trait :with_low_rate do
      flat_rate -20
    end
  end

end
