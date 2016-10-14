class PullRequest < ApplicationRecord

  belongs_to :parent_plan, foreign_key: :parent_plan_id, class_name: "LessonPlan"
  belongs_to :forked_plan, foreign_key: :forked_plan_id, class_name: "LessonPlan" 

  has_many :comments, as: :commentable
end
