class TeacherFollowingsController < ApplicationController

  def index
    if params[:follower_id]
      @teachers = TeacherFollowing.where("follower_id = ?", params[:follower_id]).map{|tf| Teacher.find(tf.followed_id)}
    elsif params[:followed_id]
      @teachers = TeacherFollowing.where("followed_id = ?", params[:followed_id]).map{|tf| Teacher.find(tf.follower_id)}
    end
    @currentUser = current_teacher
    respond_to do |format|
      format.json {render "index.json.jbuilder"}
    end
  end

  def create

  end

  def destroy

  end
end
