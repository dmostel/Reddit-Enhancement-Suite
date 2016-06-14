addModule('floater', (module, moduleID) => {
	module.category = ['Productivity'];
	module.moduleName = 'Floating Islands';
	module.description = 'Managing free-floating RES elements';
	module.alwaysEnabled = true;
	module.hidden = false;
	module.options = {
		keepOnTheLeft: {
			type: 'boolean',
			value: true,
			description: 'Set the floater to display on the left side of the screen. It may get in the way of controls, but it is closer to where your mouse spends most of its time.'
		}
	};
	
	const defaultContainer = 'visibleAfterScroll';
	const containers = {
		visibleAfterScroll: {
			renderElement() {
				const container = RESUtils.createElement('div', 'NREFloat', 'res-floater-visibleAfterScroll');
				container.appendChild(document.createElement('ul'));
				return container;
			},
			async css() {
				const template = await RESTemplates.load('floater-visibleAfterScroll-CSS');
				RESUtils.addCSS(template.text({
					offset: this.getOffset(),
					hoffset: this.getHoffset()
				}));
			},
			go() {
				window.addEventListener('scroll', RESUtils.debounce(() => this.onScroll(), 300));
				setTimeout(() => this.onScroll(), 500);
			},
			add(element, options) {
				if (options && options.separate) {
					$(this.element).append(element);
				} else {
					const $container = $('<li />');
					$container.append(element);
					$(this.element).find('> ul').append($container);
				}
			},
			getOffset() {
				if (typeof this._offset !== 'number') {
					this._offset = 5 + RESUtils.getHeaderOffset() + $('#header-bottom-left .tabmenu').height();
				}

				return this._offset;
			},
			getHoffset(){
				if(module.options.keepOnTheLeft.value){
					return 1228;
				}
				return 8;
			},
			onScroll() {
				const show = $(window).scrollTop() > this.getOffset();
				$(this.element).toggle(show);
			}
		}
	};

	module.beforeLoad = function() {
		$.each(containers, (name, container) => {
			if (!container.element && typeof container.renderElement === 'function') {
				container.element = container.renderElement();
			}
		});
	};

	module.go = function() {
		const elements = $.map(containers, container => container.element);
		$(document.body).append(elements);

		$.map(containers, container => {
			if (typeof container.css === 'function') {
				return container.css();
			}
			return container.css;
		})
			.filter(css => css)
			.forEach(css => RESUtils.addCSS(css));

		$.each(containers, (name, container) => {
			if (typeof container.go === 'function') {
				container.go();
			}
		});
	};

	module.addElement = function(element, options) {
		const container = containers[options && options.container] || containers[defaultContainer];
		if (typeof container.add === 'function') {
			container.add(element, options);
		} else {
			$(container.element).append(element);
		}
	};
});
