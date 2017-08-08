var Calendar = (function() {

    const _locales = {
        'cs-CZ': {
            months: [ 'Leden', 'Únor', 'Březen', 'Duben', 'Květen', 'Červen', 'Červenec', 'Srpen', 'Září', 'Říjen', 'Listopad', 'Prosinec' ],
            days: [ 'Po', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne' ]
        },
        'en-US': {
            months: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
            days: [ 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su' ]
        }
    };

    var _date = new Date();

    var _options = {
        controls: {
            calendar_root: 'sa-calendar',
            input_wrapper: 'sa-cal-input-wrapper',
            input_field: {
                class: 'sa-cal-field',
                name: 'cal-date',
                effect: 'sa-cal-effect-line'
            },
            content_wrapper: 'sa-cal-wrapper',
            controls: 'sa-cal-controls',
            buttons: 'sa-cal-change',
            prev: 'sa-cal-prev-month',
            heading: 'sa-cal-current',
            next: 'sa-cal-next-month',
            content: 'sa-cal-content',
            cell: 'sa-cal-cell',
            day_caption: 'sa-cal-day',
            item: 'sa-cal-day-no',
            clear: 'sa-clr'
        },
        input_effect: true,
        locale: 'cs-CZ', //used to localize calendar heading (supported: cs-CZ, en-US)
        year: _date.getFullYear(),
        month: _date.getMonth()
    };

    var _heading = null;
    var _items = null;
    var _input_field = null;
    var _prev_day_count = null, _day_count = null;
    var _selected_date = {
        year: _options.year,
        month: _options.month,
        day: _date.getDate(),
        toString: function () {
            return this.day + '/' + (this.month+1) + '/' + this.year;
        },
        setDate: function (y, m, d) {
            this.year = y;
            this.month = m;
            this.day = d;
        }
    };

    var init = function (options) {
        if (typeof Object.assign != 'function') {
            // Must be writable: true, enumerable: false, configurable: true
            Object.defineProperty(Object, "assign", {
                value: function assign(target, varArgs) { // .length of function is 2
                    'use strict';
                    if (target == null) { // TypeError if undefined or null
                        throw new TypeError('Cannot convert undefined or null to object');
                    }

                    var to = Object(target);

                    for (var index = 1; index < arguments.length; index++) {
                        var nextSource = arguments[index];

                        if (nextSource != null) { // Skip over if undefined or null
                            for (var nextKey in nextSource) {
                                // Avoid bugs when hasOwnProperty is shadowed
                                if (Object.prototype.hasOwnProperty.call(nextSource, nextKey)) {
                                    to[nextKey] = nextSource[nextKey];
                                }
                            }
                        }
                    }
                    return to;
                },
                writable: true,
                configurable: true
            });
        }
        _options = Object.assign({}, _options, options);


        var prev_btn = document.querySelector('.' + _options.controls.prev);
        var next_btn = document.querySelector('.' + _options.controls.next);

        _input_field = document.querySelector('.' + _options.controls.input_field.class);
        _heading = document.querySelector('.' + _options.controls.heading);
        _items = document.getElementsByClassName(_options.controls.item);

        prev_btn.addEventListener('click', prevMonth);
        next_btn.addEventListener('click', nextMonth);
        for (var i = 0; i < _items.length; i++) {
            _items[i].addEventListener('click', selectDate);
        }
        _input_field.addEventListener('blur', reRender);
        _input_field.addEventListener('keyup', handleKeyUp);

        setHeading();
        setSelected(_selected_date.day);
        countPositions();
    };

    var prevMonth = function(e) {
        e.preventDefault();

        if (_options.month === 0) {
            _options.year--;
            _options.month = 11;
        } else {
            _options.month--;
        }

        _prev_day_count = _day_count;
        setHeading();
        handleSwitchMonth();
        countPositions();
    };

    var nextMonth = function(e) {
        e.preventDefault();

        if (_options.month === 11) {
            _options.year++;
            _options.month = 0;
        } else {
            _options.month++;
        }

        _prev_day_count = _day_count;
        setHeading();
        handleSwitchMonth();
        countPositions();
    };

    var selectDate = function(e) {
        e.preventDefault();

        if (_options.input_effect) {
            _input_field.nextElementSibling.className += ' toggled';
            var inter = setInterval(function() {
                clearClass(_input_field.nextElementSibling, 'toggled');
                clearInterval(inter);
            }, 1000);
        }

        setSelected(this.getAttribute('data-date'));
    };

    var handleKeyUp = function (e) {
        if (e.keyCode === 13) {
            this.blur();
            reRender();
        }
    };

    var reRender = function () {
        var parsed_input = _input_field.value.match(/[0-9]+/g);

        if (parsed_input.length === 3) {
            var d = new Date(Date.parse(
                parseInt(parsed_input[1]) + '/' + parsed_input[0] + '/' + parsed_input[2]
            ));

            if (checkInput(d, parsed_input[0])) {
                if (Object.prototype.toString.call(d) === "[object Date]") {
                    if (!isNaN(d.getTime())) {
                        _options.year = d.getFullYear();
                        _options.month = d.getMonth();
                        countPositions();
                        setSelected(parsed_input[0]);
                        setHeading();
                    }
                }
            }
        }
    };

    var setSelected = function (clicked_date) {
        clicked_date = parseInt(clicked_date);
        clearClass(_items[_selected_date.day - 1], 'selected');
        _items[clicked_date - 1].className += ' selected';
        _selected_date.setDate(_options.year, _options.month, clicked_date);
        _input_field.value = _selected_date.toString();
    };

    var handleSwitchMonth = function() {
        if (!datesCompare()) {
            clearClass(_items[_selected_date.day - 1], 'selected');
        } else _items[_selected_date.day - 1].className += ' selected';
    };

    var datesCompare = function() {
        if (_selected_date.month !== _options.month) return false;
        return _selected_date.year === _options.year;
    };

    var countPositions = function() {
        _date.setFullYear(_options.year, _options.month + 1, 0);
        _day_count = _date.getDate();
        var margin = 0;

        _date.setDate(1);
        var first_day = _date.getDay() - 1; // First day - Monday (no margin)

        if (first_day === -1) { // Sunday - max margin
            margin = 18;
        } else {
            margin = first_day * 3;
        }

        _items[0].parentNode.style.marginLeft = margin + 'em';

        var diff = 0;
        var display = 'block';

        if (_prev_day_count === null) {
            diff = _items.length - _day_count;
            display = 'none';
        } else if (_day_count > _prev_day_count) {
            diff = _day_count - _prev_day_count;
            display = 'block';
        } else if (_day_count < _prev_day_count) {
            diff = _prev_day_count - _day_count;
            display = 'none';
        }

        for (var i = _items.length - diff; i < _items.length; i++)
            _items[i].style.display = display
    };

    var getString = function (include_year) {
        if (include_year) {
            return _locales[_options.locale].months[_options.month] + ' ' + _options.year;
        } else {
            return _locales[_options.locale].months[_options.month];
        }
    };

    var getSelectedDate = function() {
        return _selected_date.toString();
    };

    var setHeading = function() {
        _heading.innerText = getString(true);
    };

    var checkInput = function (date, input_day_value) {
        var temp = new Date(date);
        temp.setMonth(date.getMonth()+1, 0);

        if (parseInt(input_day_value) !== date.getDate()) return false;
        return temp.getDate() >= date.getDate();
    };

    var clearClass = function(element, class_name) {
        var str = '(?:^|\\s)' + class_name + '(?!\\S)';
        var pattern = new RegExp(str);

        element.className = element.className.replace(pattern , '');
    };

    var createComponent = function (elem) {
        var calendar = document.createElement('div'),
            input_wrapper = document.createElement('div'),
            input_field = document.createElement('input'),
            content_wrapper = document.createElement('div'),
            controls = document.createElement('div'),
            prev_btn = document.createElement('a'),
            heading = document.createElement('span'),
            next_btn = document.createElement('a'),
            content = document.createElement('div'),
            ul = document.createElement('ul'),
            clear = document.createElement('div');
        calendar.className = _options.controls.calendar_root;
        input_wrapper.className = _options.controls.input_wrapper;
        calendar.appendChild(input_wrapper);
        input_field.className = _options.controls.input_field.class;
        input_field.type = 'text';
        input_field.name = _options.controls.input_field.name;
        input_wrapper.appendChild(input_field);

        if (_options.input_effect) {
            var effectDiv = document.createElement('div');
            effectDiv.className = _options.controls.input_field.effect;
            input_wrapper.appendChild(effectDiv);
        }

        content_wrapper.className = _options.controls.content_wrapper;

        controls.className = _options.controls.controls;
        prev_btn.href = '#';
        prev_btn.className = _options.controls.buttons + ' ' + _options.controls.prev;
        prev_btn.innerHTML = "&lt;";

        heading.className = _options.controls.heading;
        heading.innerHTML = '&nbsp;';

        next_btn.href = '#';
        next_btn.className = _options.controls.buttons + ' ' + _options.controls.next;
        next_btn.innerHTML = "&gt;";

        controls.appendChild(prev_btn);
        controls.appendChild(heading);
        controls.appendChild(next_btn);

        content.className = _options.controls.content;

        for (var i = 0; i < 7; i++) { // day names
            var item = document.createElement('li');
            item.className = _options.controls.cell + ' ' + _options.controls.day_caption;
            item.textContent = _locales[_options.locale].days[i];

            ul.appendChild(item);
        }

        for (var i = 1; i <= 31; i++) {
            var item = document.createElement('li');
            var link = document.createElement('a');

            item.className = _options.controls.cell;
            link.className = _options.controls.item;
            link.href = '#';
            link.setAttribute('data-date', i.toString());
            link.text = i;

            item.appendChild(link);
            ul.appendChild(item);
        }

        clear.className = _options.controls.clear;

        content.appendChild(ul);
        content.appendChild(clear);

        content_wrapper.appendChild(controls);
        content_wrapper.appendChild(content);

        calendar.appendChild(input_wrapper);
        calendar.appendChild(content_wrapper);

        elem.appendChild(calendar);
    };

    return {
        init: init,
        getDate: getSelectedDate,
        createComponent: createComponent
    };

})();