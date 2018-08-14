import Validator from './validator';

/**
 * Notifications Validator Class
 */
export default class NotificationsValidator extends Validator {
  /**
   * @returns { Array }
   */
  see() {
    this.checkBody('notifications', this.__('Required %s', 'notifications')).notEmpty();
    if (this.req.body.notifications !== undefined) {
      this.checkBody('notifications', this.__('NotAnArray %s', 'notifications')).isArray();
      this.checkBody('notifications', this.__('UniqueArray %s', 'notifications')).isDistinct();
      this.checkBody('notifications.*', this.__('InvalidArrayContent %s', 'notifications')).exists().isIdValid();
    }
    return this.validationErrors() || [];
  }
}