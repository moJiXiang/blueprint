/*
 * Copyright 2018 Palantir Technologies, Inc. All rights reserved.
 *
 * Licensed under the terms of the LICENSE file distributed with this project.
 */

import { assert } from "chai";
import { mount, ReactWrapper } from "enzyme";
import * as React from "react";
import { spy } from "sinon";

import { Classes, IPanel, IPanelProps, IPanelStackProps, PanelStack } from "../../src/index";

export class TestPanel extends React.Component<IPanelProps> {
    public render() {
        return (
            <div>
                <button id="new-panel-button" onClick={this.openPanel} />
                <button id="close-panel-button" onClick={this.props.closePanel} />
            </div>
        );
    }

    private openPanel = () => this.props.openPanel(TestPanel, {}, { title: "New Panel 1" });
}

describe("<PanelStack>", () => {
    let testsContainerElement: HTMLElement;
    let panelStackWrapper: IPanelStackWrapper;

    const initialPanel: IPanel = {
        component: TestPanel,
        props: {},
        title: "Test Title",
    };

    beforeEach(() => {
        testsContainerElement = document.createElement("div");
        document.body.appendChild(testsContainerElement);
    });

    afterEach(() => {
        if (panelStackWrapper !== undefined) {
            panelStackWrapper.unmount();
            panelStackWrapper.detach();
            panelStackWrapper = undefined;
        }
        testsContainerElement.remove();
    });

    it("renders a basic panel and allows opening and closing", () => {
        panelStackWrapper = renderPanelStack({ initialPanel });
        assert.exists(panelStackWrapper);

        const newPanelButton = panelStackWrapper.find("#new-panel-button");
        assert.exists(newPanelButton);
        newPanelButton.simulate("click");

        const newPanelHeader = panelStackWrapper.findClass(Classes.PANELSTACK_HEADER_TITLE);
        assert.exists(newPanelHeader);
        assert.equal(newPanelHeader.at(0).text(), "New Panel 1");

        const backButton = panelStackWrapper.findClass(Classes.PANELSTACK_HEADER_BACK);
        assert.exists(backButton);
        backButton.simulate("click");

        const oldPanelHeader = panelStackWrapper.findClass(Classes.PANELSTACK_HEADER_TITLE);
        assert.exists(oldPanelHeader);
        assert.equal(oldPanelHeader.at(1).text(), "Test Title");
    });

    it("calls the callback handlers onOpen and onClose", () => {
        const onOpen = spy();
        const onClose = spy();
        panelStackWrapper = renderPanelStack({ initialPanel, onClose, onOpen });

        const newPanelButton = panelStackWrapper.find("#new-panel-button");
        assert.exists(newPanelButton);
        newPanelButton.simulate("click");
        assert.isTrue(onOpen.calledOnce);
        assert.isFalse(onClose.calledOnce);

        const backButton = panelStackWrapper.findClass(Classes.PANELSTACK_HEADER_BACK);
        assert.exists(backButton);
        backButton.simulate("click");
        assert.isTrue(onClose.calledOnce);
        assert.isTrue(onOpen.calledOnce);
    });

    it("does not call the callback handler onClose when there is only a single panel on the stack", () => {
        const onClose = spy();
        panelStackWrapper = renderPanelStack({ initialPanel, onClose });
        const closePanel = panelStackWrapper.find("#close-panel-button");
        assert.exists(closePanel);
        closePanel.simulate("click");
        assert.equal(onClose.callCount, 0);
    });

    it("does not have the back button when only a single panel is on the stack", () => {
        panelStackWrapper = renderPanelStack({ initialPanel });
        const backButton = panelStackWrapper.findClass(Classes.PANELSTACK_HEADER_BACK);
        assert.equal(backButton.length, 0);
    });

    it("assigns the class to both the TransitionGroup and the PanelView", () => {
        const TEST_CLASS_NAME = "TEST_CLASS_NAME";
        panelStackWrapper = renderPanelStack({ initialPanel, className: TEST_CLASS_NAME });
        const foundClasses = panelStackWrapper.findClass(TEST_CLASS_NAME);
        assert.equal(foundClasses.length, 2);
    });

    interface IPanelStackWrapper extends ReactWrapper<IPanelStackProps, any> {
        findClass(className: string): ReactWrapper<React.HTMLAttributes<HTMLElement>, any>;
    }

    function renderPanelStack(props: IPanelStackProps): IPanelStackWrapper {
        panelStackWrapper = mount(<PanelStack {...props} />, { attachTo: testsContainerElement }) as IPanelStackWrapper;
        panelStackWrapper.findClass = (className: string) => panelStackWrapper.find(`.${className}`).hostNodes();
        return panelStackWrapper;
    }
});