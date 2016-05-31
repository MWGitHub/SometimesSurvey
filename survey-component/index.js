/** @jsx element */
/* eslint-disable import/no-unresolved */
import { element } from 'deku';
import stater from './state';

function initialState() {
  return {
    hasAnimated: false,
    isAnimating: true,
    container: null,
  };
}

function checkScroll({ props, state }) {
  if (!state.container) return;
  const container = state.container;
  const percent = props.percent || 0.75;

  let middle = window.pageYOffset || document.documentElement.scrollTop;
  middle += window.innerHeight / 2;
  const itemBottom = container.offsetTop + container.offsetHeight;
  const space = itemBottom - middle;

  if (space < 0 || space / container.offsetHeight <= 1 - percent) {
    props.onSurveyShown && props.onSurveyShown(props.item);
    props.onImpression && props.onImpression(props.item);
  }
}

function checkItem({ props }) {
  if (props.item === undefined || props.item === null) {
    props.onItemStatus && props.onItemStatus(false);
    return;
  }

  if (!props.onCheckItem) return;

  props.onCheckItem(props.item).then(result => {
    props.onItemStatus && props.onItemStatus(result);
  });
}

function toggleScrollChecks(model) {
  const { props, state, setState } = model;
  if (props.show && state.isAnimating) {
    setState({ isAnimating: false }, true);
    return;
  }

  if (!props.valid || state.hasAnimated) return;

  model.setState({ hasAnimated: true }, true);

  window.requestAnimationFrame(function frame() {
    if (state.isAnimating) {
      checkScroll(model);
      window.requestAnimationFrame(frame);
    }
  });
}

function render({ props }) {
  let footer = null;
  if (props.show) {
    footer = (
      <div class="survey__footer">

      </div>
    );
  }

  return (
    <div class="survey">
      {footer}
    </div>
  );
}

function onCreate(model) {
  const props = model.props;
  model.setState({
    container: props.container,
  }, true);
  checkItem(model);

  toggleScrollChecks(model);
}

function onUpdate(model) {
  const props = model.props;
  model.setState({
    container: props.container,
  }, true);
  if (model.state.container !== model.props.container) {
    checkItem(model);
    model.setState({ container: model.props.container }, true);
  }

  toggleScrollChecks(model);
}

function onRemove({ setState }) {
  setState({ isAnimating: false }, true);
}

// :(
// Couldn't think of doing this cleanly without states when multiple
// survey components are needed.
export default stater({
  render,
  onCreate,
  onUpdate,
  onRemove,
}, initialState);
