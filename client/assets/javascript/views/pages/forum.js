import Backbone from 'backbone';
import _ from 'underscore';
import $ from 'jquery';

import template from 'views/templates/forum.html';

import config from 'config';

export default Backbone.View.extend({
  tagName: 'div',

  className: 'page forum-page',

  events: {
    'click .js-new-thread-button': 'showNewThreadModal',
    'click .js-new-thread-cancel': 'hideNewThreadModal',
    'click .js-new-thread-submit': 'postNewThread'
  },

  template,


  render() {

    this.$el.html(
      _.template(
        this.template({
        })
      )
    );

    return this;
  },

  close() {
    this.remove();
  },

  showNewThreadModal() {
    this.$('.js-new-thread-modal').addClass('is-shown');
    $('body').addClass('is-scrolling-disabled');
  },

  hideNewThreadModal() {
    this.$('.js-new-thread-modal').removeClass('is-shown');
    $('body').removeClass('is-scrolling-disabled');
  },

  postNewThread() {
    const self = this;
    const title = this.$('.js-new-thread-title').val();
    const content = this.$('.js-new-thread-content').val();

    $.ajax({
      url: `${config.apiEndpoint}/thread`,
      method: 'POST',
      data: {
        title,
        content
      }
    }).done((response) => {
      console.log(response);
      self.hideNewThreadModal();
    })
  }
});
