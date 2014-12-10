define(
    'dh-select',
    [],
    function () {
        var console = getCustomConsole(true);

        return Control;

        function Control($target, data, options) {
            var that = this,
                $control,
                list;

            extend(options, {
                valueChangedCallback: valueChangedEvent
            });
            list = new List(options, data);
            $control = render();
            setEvents($control, list);

            $target.html($control);
            $target.append(list.render());

            that.$el = $control;

            function render() {
                var $control = $('<input>', {
                    type: 'text',
                    class: 'dh-select-input'
                });

                return $control;
            }

            function setEvents($control, list) {
                $control.on('click', toggleList);
            }

            function toggleList() {
                if (list.isShown) {
                    list.hide();
                } else {
                    list.show();
                }
            }

            function valueChangedEvent(value) {
                $control.val(value ? value.title : '');
                setTimeout(function () {
                    $control.trigger('change');
                }, 1);
            }
        }

        function List(options, userData) {
            var that = this,
                classes = {
                    collapsed: 'collapsed',
                    hasChildren: 'has-children'
                },
                data = userData || [],
                $that;

            that.isShown = false;

            that.render = function ($control) {
                if (typeof $that !== 'undefined') {
                    console.warn('List is already rendered.');
                    return;
                }

                $that = renderList(options.name, data);
                that.hide();
                that.collapseAll();
                $that = setListEvents($that);

                return $that;
            };

            that.show = function () {
                if (typeof $that === 'undefined') {
                    console.error('List is not rendered yet. Call "render" method before "show".');
                }
                that.collapseAll();
                $that.show();
                that.isShown = true;
            };

            that.collapseAll = function () {
                $that.find('.has-children').addClass(classes.collapsed);
            };

            that.hide = function () {
                $that.hide();
                that.isShown = false;
            };

            that.setCurrentValue = function (id) {
                console.warn('Not implemented yet.');
            };

            function renderList(name, list) {
                var $ul, $li;

                $ul = $('<ul>', {
                    class: 'dh-select-list'
                });
                for (var i = 0; i < list.length; i++) {
                    $li = $('<li>');
                    $li.html(getListItem(name, list[i].value, list[i].title));
                    if (list[i].childs) {
                        $li.addClass(classes.hasChildren);
                        $li.append(renderList(name, list[i].childs));
                    }
                    $ul.append($li);
                }

                return $ul;

                function getListItem(name, value, label) {
                    return getInput(name, value) + getLabel(name, value, label);

                    function getInput(name, value) {
                        return '<input name="' + name + '"' +
                        ' id="' + getControlId(name, value) + '"' +
                        ' value="' + value + '"' +
                        ' type="radio"></input>';
                    }

                    function getLabel(name, value, label) {
                        return '<label for="' + getControlId(name, value) + '">' + label + ' (' + value + ')' + '</label>';
                    }

                    function getControlId(name, value) {
                        return name + '_' + value;
                    }
                }
            }

            function setListEvents($list) {
                $list.find('label')
                    .on('click', listItemClickEvent)
                    .on('dblclick', listItemDblClickEvent);

                return $list;

                function listItemClickEvent(e) {
                    var $input = $list.find('#' + $(e.target).attr('for')),
                        valueId = parseInt($input.val(), 10),
                        value = getValueById(valueId, data);

                    $input.closest('li').toggleClass(classes.collapsed);
                    if (typeof value.childs === 'undefined') {
                        that.hide();
                    }

                    options.valueChangedCallback({
                        value: value.value,
                        title: value.title
                    });
                }

                function listItemDblClickEvent(e) {
                    that.hide();
                }
            }

            function getValueById(id, data) {
                var node,
                    result = null;

                for (var i = 0; i < data.length; i++) {
                    node = data[i];
                    if (node.value === id) {
                        result = node;
                    } else if (node.childs) {
                        result = result || getValueById(id, node.childs);
                    }
                }

                return result;
            }
        }

        function extend(obj1, obj2) {
            for (var key in obj2) {
                if (obj2.hasOwnProperty(key)) {
                    obj1[key] = obj2[key];
                }
            }

            return obj1;
        }

        function getCustomConsole(enabled) {
            var c = window.console,
                console = {
                    enabled: enabled
                };

            for (var key in c) {
                if (typeof c[key] === 'function') {
                    console[key] = (function (key) {
                        return function () {
                            if (this.enabled) {
                                c[key].apply(c, arguments);
                            }
                        };
                    })(key);
                }
            }

            return console;
        }
    }
);
