define(
    'dh-select',
    [],
    function () {
        var console = getCustomConsole(true),
            classes = {
                collapsed: 'collapsed',
                hasChildren: 'has-children'
            },
            options = {
                name: 'unnamed-control'
            },
            API = {
                init: initialize
            },
            data = [],
            $control = null,
            $list = null;

        return API;

        function initialize($target, customData, customOptions) {
            data = customData || data;
            extend(options, customOptions);

            $target.empty();
            $control = renderControl();
            $control
                .on('click', showList);
            $target.append($control);
        }

        function renderControl() {
            var $control = $('<input>', {
                type: 'text',
                class: 'dh-select-input'
            });

            return $control;
        }

        function showList() {
            if (!$list) {
                $list = renderList(options.name, data);
                $list
                    .find('label')
                        .on('click', listItemClickEvent)
                        .on('dblclick', listItemDblClickEvent);
                $list.insertAfter($control);
                collapseAll();
            }
        }

        function hideList() {
            if (!!$list) {
                $list.remove();
                $list = null;
            }
        }

        function listItemClickEvent(e) {
            var $input = $list.find('#' + $(e.target).attr('for')),
                valueId = parseInt($input.val(), 10),
                value = getValueById(valueId, data);

            $input.siblings('ul').toggleClass(classes.collapsed);
            if (typeof value.childs === 'undefined') {
                hideList();
            }
            setCurrentValue(value);
        }

        function listItemDblClickEvent(e) {
            hideList();
        }

        function setCurrentValue(value) {
            $control.val(value ? value.title : '');
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
                    $li.append( renderList(name, list[i].childs));
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

        function collapseAll() {
            $list.find('ul').addClass(classes.collapsed);
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
