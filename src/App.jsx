/* eslint-disable jsx-a11y/accessible-emoji */
import React, { useState } from 'react';
import cn from 'classnames';
import './App.scss';

import usersFromServer from './api/users';
import categoriesFromServer from './api/categories';
import productsFromServer from './api/products';

const productsWithCategories = productsFromServer.map(product => {
  const category = categoriesFromServer.find(
    categoryToFind => product.categoryId === categoryToFind.id,
  );

  return { ...product, category };
});

const products = productsWithCategories.map(product => {
  const user = usersFromServer.find(
    userToFind => userToFind.id === product.category.ownerId,
  );

  return { ...product, owner: user };
});

const filtersHandler = (array, { selectByUser, query, selectedCategories }) => {
  let prepared = array.filter(product => {
    return product.name.toLowerCase().includes(query.toLowerCase());
  });

  if (selectByUser !== 'all') {
    prepared = prepared.filter(product => product.owner.name === selectByUser);
  }

  // prettier-ignore
  if (selectedCategories.length > 0) {
    prepared = prepared.filter(product =>
      selectedCategories.some(category => {
        return product.category.title === category;
      }));
  }

  return prepared;
};

export const App = () => {
  const [selectByUser, setSelectByUser] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedCategories, setSelectedCategories] = useState([]);

  const preparedProducts = filtersHandler(products, {
    selectByUser,
    query,
    selectedCategories,
  });

  return (
    <div className="section">
      <div className="container">
        <h1 className="title">Product Categories</h1>

        <div className="block">
          <nav className="panel">
            <p className="panel-heading">Filters</p>

            <p className="panel-tabs has-text-weight-bold">
              <a
                className={cn({ 'is-active': selectByUser === 'all' })}
                onClick={() => setSelectByUser('all')}
                data-cy="FilterAllUsers"
                href="#/"
              >
                All
              </a>

              {usersFromServer.map(user => {
                return (
                  <User
                    key={user.id}
                    user={user}
                    selectByUser={selectByUser}
                    setSelectByUser={setSelectByUser}
                  />
                );
              })}
            </p>

            <div className="panel-block">
              <p className="control has-icons-left has-icons-right">
                <input
                  data-cy="SearchField"
                  type="text"
                  className="input"
                  placeholder="Search"
                  value={query}
                  onChange={event => setQuery(event.target.value)}
                />

                <span className="icon is-left">
                  <i className="fas fa-search" aria-hidden="true" />
                </span>
                {query && (
                  <span className="icon is-right">
                    {/* eslint-disable-next-line jsx-a11y/control-has-associated-label */}
                    <button
                      data-cy="ClearButton"
                      type="button"
                      className="delete"
                      onClick={() => setQuery('')}
                    />
                  </span>
                )}
              </p>
            </div>

            <div className="panel-block is-flex-wrap-wrap">
              <a
                href="#/"
                data-cy="AllCategories"
                className={cn('button is-success mr-6', {
                  'is-outlined': selectedCategories.length > 0,
                })}
                onClick={() => setSelectedCategories([])}
              >
                All
              </a>
              {categoriesFromServer.map(category => {
                return (
                  <Category
                    key={category.id}
                    category={category}
                    selectedCategories={selectedCategories}
                    setSelectedCategories={setSelectedCategories}
                  />
                );
              })}
            </div>

            <div className="panel-block">
              <a
                data-cy="ResetAllButton"
                href="#/"
                className="button is-link is-outlined is-fullwidth"
                onClick={() => {
                  setQuery('');
                  setSelectByUser('all');
                  setSelectedCategories([]);
                }}
              >
                Reset all filters
              </a>
            </div>
          </nav>
        </div>

        <div className="box table-container">
          {preparedProducts.length === 0 ? (
            <p data-cy="NoMatchingMessage">
              No products matching selected criteria
            </p>
          ) : (
            <table
              data-cy="ProductTable"
              className="table is-striped is-narrow is-fullwidth"
            >
              <thead>
                <tr>
                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      ID
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Product
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort-down" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      Category
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort-up" />
                        </span>
                      </a>
                    </span>
                  </th>

                  <th>
                    <span className="is-flex is-flex-wrap-nowrap">
                      User
                      <a href="#/">
                        <span className="icon">
                          <i data-cy="SortIcon" className="fas fa-sort" />
                        </span>
                      </a>
                    </span>
                  </th>
                </tr>
              </thead>

              <tbody>
                {preparedProducts.map(product => {
                  return <Product key={product.id} product={product} />;
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export const Product = ({ product }) => {
  return (
    <tr data-cy="Product">
      <td className="has-text-weight-bold" data-cy="ProductId">
        {product.id}
      </td>

      <td data-cy="ProductName">{product.name}</td>
      <td data-cy="ProductCategory">
        {product.category.icon} - {product.category.title}
      </td>

      <td
        data-cy="ProductUser"
        className={cn(
          { 'has-text-link': product.owner.sex === 'm' },
          { 'has-text-danger': product.owner.sex === 'f' },
        )}
      >
        {product.owner.name}
      </td>
    </tr>
  );
};

export const User = ({ user, selectByUser, setSelectByUser }) => {
  return (
    <a
      data-cy="FilterUser"
      href="#/"
      className={cn({ 'is-active': selectByUser === user.name })}
      onClick={() => setSelectByUser(user.name)}
    >
      {user.name}
    </a>
  );
};

export const Category = ({
  category,
  selectedCategories,
  setSelectedCategories,
}) => {
  const isSelected = selectedCategories.includes(category.title);

  const toggleCategory = () => {
    if (isSelected) {
      setSelectedCategories(
        selectedCategories.filter(title => title !== category.title),
      );
    } else {
      setSelectedCategories([...selectedCategories, category.title]);
    }
  };

  return (
    <a
      data-cy="Category"
      className={cn('button mr-2 my-1', {
        'is-info': isSelected,
      })}
      onClick={toggleCategory}
      href="#/"
    >
      {category.title}
    </a>
  );
};
