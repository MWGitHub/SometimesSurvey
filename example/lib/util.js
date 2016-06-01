/** @jsx element */
import { element } from 'deku';

function isMobile() {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent);
}

const likeButton = <div class="fb-like" data-href="https://code-splat.com" data-layout="button" data-action="like" data-show-faces="false" data-share="false"></div>;

export default {
  isMobile,
  likeButton,
};
