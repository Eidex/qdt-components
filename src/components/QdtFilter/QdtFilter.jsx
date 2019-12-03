/**
 * @name QdtFilter
 * @param {bool} single [false] - If we want single selections only. For regular menu like components
 * @param {bool} hideStateCountsBar [false] -
 * @param {string} placeholder [Dropdown] - Custom text on the DropDown
 * @param {bool} showStateInDropdown [false] - Selection state in the placeholder
 * @param {bool} expanded [false] - Display as a list object
 * @param {bool} expandedHorizontal [false] - Display as tabs
 * @param {bool} expandedHorizontalSense [false] -
 * @param {bool} qSortByAscii [1] - For sorting the list. 1 = ASC, 0 = none, -1 = DESC
 * @description
 * Filter component for custom filters.
 * DropDown, List or Tabs
*/

import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import {
  LuiDropdown, LuiList, LuiSearch, LuiTabset,
} from '../QdtLui';
import useListObject from '../../hooks/useListObject';
import QdtVirtualScroll from '../QdtVirtualScroll/QdtVirtualScroll';
import DropdownItemList from './DropdownItemList';
import ExpandedHorizontalTab from './ExpandedHorizontalTab';
import StateCountsBar from './StateCountsBar';
import '../../styles/index.scss';

let searchListInputValue = '';
let qStateCounts = 0;
let totalStateCounts = {};

/** The Actual Component */
const QdtFilter = ({
  qDocPromise, cols, qPage, showStateInDropdown, single, hideStateCountsBar, expanded, expandedHorizontal, expandedHorizontalSense, placeholder,
}) => {
  const [dropdownOpen, setDropDownOpen] = useState(false);
  // const [searchListInputValue, setSearchListInputValue] = useState('');

  const {
    beginSelections, endSelections, qLayout, qData, offset, selections, select, searchListObjectFor, acceptListObjectSearch,
  } = useListObject({ qDocPromise, cols, qPage });


  const _searchListObjectFor = (event) => {
    searchListInputValue = event.target.value;
    // offset(0);
    searchListObjectFor(event.target.value);
  };

  /** Clear all of the selections */
  const clear = () => {
    searchListInputValue = '';
    searchListObjectFor('');
  };

  const _acceptListObjectSearch = (event) => {
    if (event.charCode === 13) {
      searchListInputValue = '';
      acceptListObjectSearch();
    }
  };

  /** Toggle dropdown visibility */
  const toggle = () => {
    if (!dropdownOpen) {
      beginSelections();
    } else {
      endSelections(true);
      clear();
    }
    setDropDownOpen(!dropdownOpen);
  };

  /** Make Selections */
  const _select = (event) => {
    const { qElemNumber, qState } = event.currentTarget.dataset; // qText
    if (qState === 'S') { select(Number(qElemNumber)); } else { select(Number(qElemNumber), !single); }
    if (single) toggle();
  };

  useEffect(() => {
    if (qData) {
      qStateCounts = qLayout.qListObject.qDimensionInfo.qStateCounts;
      totalStateCounts = Object.values(qStateCounts).reduce((a, b) => a + b);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qData]);

  return (
    <>
      { qData && !expanded && !expandedHorizontal
        && (
        <LuiDropdown isOpen={dropdownOpen} toggle={() => toggle()}>
          <span>
            {!showStateInDropdown && placeholder}
            {(showStateInDropdown && selections && selections.length === 0) && placeholder}
            {(showStateInDropdown && selections && selections.length === 1) && `${placeholder}: ${selections[0][0].qText}`}
            {(showStateInDropdown && selections && selections.length > 1) && `${placeholder}: ${selections.length} of ${totalStateCounts}`}
          </span>
          <LuiList style={{ width: '15rem' }}>
            <LuiSearch
              value={searchListInputValue}
              clear={clear}
              onChange={_searchListObjectFor}
              onKeyPress={_acceptListObjectSearch}
            />
            <QdtVirtualScroll
              qData={qData}
              qcy={qLayout.qListObject.qSize.qcy}
              Component={DropdownItemList}
              componentProps={{ qData, select: _select }}
              offset={offset}
              rowHeight={38}
              viewportHeight={190}
            />
          </LuiList>
          {!hideStateCountsBar
            && <StateCountsBar totalStateCounts={totalStateCounts} selections={selections} />}
        </LuiDropdown>
        )}
      { qData && expanded
        && (
        <LuiList style={{ width: '15rem' }}>
          <LuiSearch
            value={searchListInputValue}
            clear={clear}
            onChange={_searchListObjectFor}
            onKeyPress={acceptListObjectSearch}
          />
          <QdtVirtualScroll
            qData={qData}
            qcy={qLayout.qListObject.qSize.qcy}
            Component={DropdownItemList}
            componentProps={{ select }}
            offset={offset}
            rowHeight={38}
            viewportHeight={190}
          />
        </LuiList>
        )}
      { qData && expandedHorizontal
        && (
        <LuiTabset
          fill
          style={{ height: '100%' }}
        >
          <ExpandedHorizontalTab
            qData={qData}
            select={select}
            expandedHorizontalSense={expandedHorizontalSense}
          />
        </LuiTabset>
        )}
    </>
  );
};

QdtFilter.propTypes = {
  qDocPromise: PropTypes.object.isRequired,
  cols: PropTypes.isRequired,
  qPage: PropTypes.object,
  single: PropTypes.bool,
  hideStateCountsBar: PropTypes.bool,
  placeholder: PropTypes.string,
  showStateInDropdown: PropTypes.bool,
  expanded: PropTypes.bool,
  expandedHorizontal: PropTypes.bool,
  expandedHorizontalSense: PropTypes.bool,
};

QdtFilter.defaultProps = {
  qPage: {
    qTop: 0,
    qLeft: 0,
    qWidth: 1,
    qHeight: 100,
  },
  single: false,
  hideStateCountsBar: false,
  placeholder: 'Dropdown',
  showStateInDropdown: false,
  expanded: false,
  expandedHorizontal: false,
  expandedHorizontalSense: true,
};

export default QdtFilter;
