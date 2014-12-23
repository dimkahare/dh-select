function DhSelect($target, data, options) {
    /// Control & List variables

    var classes = {
        input: 'dh-select-input',
        controlWrapper: 'dh-select-input-wrapper',
        collapsed: 'collapsed',
        hasChildren: 'has-children',
        hidden: 'hidden',
        list: 'dh-select-list',
        underlined: 'underlined',
        listWrapper: 'dh-select-list-wrapper'
    };
    var guid = (function () {
        function s4() {
            return Math.floor((1 + Math.random()) * 0x10000)
                .toString(16)
                .substring(1);
        }

        return function () {
            return s4() + s4() + '-' + s4() + '-' + s4() + '-' +
            s4() + '-' + s4() + s4() + s4();
        };
    })();

    /// Control variables

    var list;
    var that = this;
    var id = guid();
    var $control;
    var $wrapper;

    extend(options, {
        valueChangedCallback: valueChangedEvent
    });
    list = new List(options, data);
    $wrapper = render();
    $wrapper.attr('id', id);
    $control = $wrapper.find('.' + classes.input);
    setEvents($control, list);

    $target.html($wrapper);
    $target.append(list.render(
        $control.width() +
        parseInt($control.css('padding-left'), 10) +
        parseInt($control.css('padding-right'), 10)
    ));

    that.$el = $control;

    that.setValue = function (id) {
        var value = getValueById(id, data);

        $control.val(value.title);
        list.setValue(id);
    };

    function render() {
        var $control = $('<input>', {
                type: 'text',
                class: classes.input
            }),
            $wrapper = $('<div>', {
                class: classes.controlWrapper
            });

        $wrapper.html($control);

        return $wrapper;
    }

    function setEvents($control, list) {
        $control
            .on('click', toggleList)
            .on('click', selectValue)
            .on('keypress', setFilter)
            .on('keyup', updateFilter);

        $(document).on('click', function (e) {
            if (!onListClick() && !onInputClick()) {
                list.hide();
            }

            function onListClick () {
                return !!$(e.target).parents('#' + list.id).length;
            }

            function onInputClick () {
                return !!$(e.target).parents('#' + id).length;
            }
        });
    }

    function toggleList() {
        if (list.isShown) {
            list.hide();
        } else {
            list.clearFilter();
            list.collapseAll();
            list.show();
        }
    }

    function selectValue(e) {
        e.target.setSelectionRange(0, e.target.value.length);
    }

    function setFilter(e) {
        var currentValueString = $control.val() + String.fromCharCode(e.keyCode);

        if (currentValueString) {
            list.setFilter(currentValueString);
        } else {
            list.clearFilter();
            list.collapseAll();
        }

        list.show();
    }

    function updateFilter() {
        var currentValueString = $control.val();

        if (currentValueString) {
            list.setFilter(currentValueString);
        } else {
            list.clearFilter();
            list.collapseAll();
        }
        list.show();
    }

    function valueChangedEvent(value) {
        $control.val(value ? value.title : '');
        setTimeout(function () {
            $control.trigger('change');
        }, 1);
    }

    function List(options, userData) {
        /// List variables

        var data = userData || [];
        var that = this;
        var $that;

        that.id = guid();

        that.isShown = false;

        that.render = function (width) {
            var $wrapper;

            if (typeof $that !== 'undefined') {
                return;
            }

            $that = renderList(options.name, data);
            that.hide();
            that.collapseAll();
            $that = setListEvents($that);

            $wrapper = $('<div>', {
                class: classes.listWrapper
            });
            $wrapper
                .html($that)
                .width(width)
                .attr('id', that.id);

            return $wrapper;
        };

        that.show = function () {
            if (typeof $that === 'undefined') {
                return;
            }

            $that.show();
            that.isShown = true;
        };

        that.collapseAll = function () {
            $that.find('.' + classes.hasChildren).addClass(classes.collapsed);
        };

        that.expandAll = function () {
            $that.find('.' + classes.collapsed).removeClass(classes.collapsed);
        };

        that.hide = function () {
            $that.hide();
            that.isShown = false;
        };

        that.setFilter = function (string) {
            that.clearFilter();
            that.expandAll();
            $that.find('li').addClass(classes.hidden);
            $that.find('label').each(function (indx, el) {
                var $el = $(el),
                    elText = $el.text(),
                    textIndx = elText.toLowerCase().indexOf(string.toLowerCase());

                if (textIndx !== -1) {
                    $el.removeClass(classes.hidden);
                    $el.parents('li').removeClass(classes.hidden);
                    $el.html(highlightOverlap(elText, string));
                }
            });

            function highlightOverlap(elText, string) {
                var textIndx = elText.toLowerCase().indexOf(string.toLowerCase()),
                    overlappedText = elText.substr(textIndx, string.length);

                return elText.replace(overlappedText, '<span class="' + classes.underlined + '">' + overlappedText + '</span>');
            }
        };

        that.clearFilter = function () {
            $that.find('li').removeClass(classes.hidden);
            $that.find('label').each(function (indx, el) {
                $(el)
                    .removeClass(classes.hidden)
                    .html($(el).html()
                        .replace('<span class="' + classes.underlined + '">', '')
                        .replace('</span>', '')
                );
            });
        };

        that.setValue = function (value) {
            $that.find('input[value="' + value + '"]')
                .prop('checked', true);
        };

        function renderList(name, list) {
            var $ul, $li;

            $ul = $('<ul>', {
                class: classes.list
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
                    return '<label for="' + getControlId(name, value) + '">' + label + '</label>';
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

    function extend(obj1, obj2) {
        for (var key in obj2) {
            if (obj2.hasOwnProperty(key)) {
                obj1[key] = obj2[key];
            }
        }

        return obj1;
    }
}

if (typeof define === "function" && define.amd) {
    define('dh-select', [], function () {
        return DhSelect;
    });
}
