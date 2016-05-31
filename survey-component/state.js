import debounce from './debounce';

export default function state(component, initialState, action) {
  const states = {};
  let dispatch = null;

  const update = debounce(() => {
    dispatch(action);
  }, 0);

  function setState(model) {
    return (changes, quiet) => {
      states[model.path] = Object.assign(states[model.path], changes);
      if (!quiet) {
        dispatch = model.dispatch;
        update();
      }
    };
  }

  function merge(model) {
    return Object.assign({}, model, {
      state: states[model.path],
      setState: setState(model),
    });
  }

  function render(model) {
    return component.render(merge(model));
  }

  function onCreate(model) {
    if (!states[model.path]) {
      if (initialState) {
        states[model.path] = Object.assign({}, initialState());
      } else {
        states[model.path] = {};
      }
    }
    if (component.onCreate) component.onCreate(merge(model));
  }

  function onUpdate(model) {
    if (component.onUpdate) component.onUpdate(merge(model));
  }

  function onRemove(model) {
    delete states[model.path];
    if (component.onRemove) component.onRemove(model);
  }

  return Object.assign({}, component, {
    render,
    onRemove,
    onUpdate,
    onCreate,
  });
}
