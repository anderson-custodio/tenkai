import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  Container,
  Row,
  Col,
  FormControl,
  Table,
  FormGroup,
  FormLabel
} from 'react-bootstrap';

import Button from 'components/CustomButton/CustomButton.jsx';
import { CardTenkai } from 'components/Card/CardTenkai.jsx';
import EditProductRelease from 'views/productRelease/components/EditProductRelease';
import SimpleModal from 'components/Modal/SimpleModal.jsx';

import queryString from 'query-string';

import * as productReleaseActions from 'stores/productRelease/actions';
import * as productReleaseSelectors from 'stores/productRelease/reducer';
import CardButton from 'components/CardButton/CardButton';
import * as utils from 'utils/sort';

class ProductRelease extends Component {
  constructor(props) {
    super(props);
    const values = queryString.parse(props.location.search);
    this.state = {
      productId: values.productId,
      item: {},
      showInsertUpdateForm: false,
      header: '',
      showConfirmDeleteModal: false,
      itemToDelete: {},
      inputFilter: '',
      editMode: false,
      editItem: {},
      solutionName: ''
    };
  }

  componentDidMount() {
    this.props.dispatch(
      productReleaseActions.allProductReleases(this.state.productId)
    );
  }

  handleConfirmDelete() {
    this.props.dispatch(
      productReleaseActions.deleteProductRelease(
        this.state.itemToDelete.ID,
        this.state.productId
      )
    );

    this.setState({ showConfirmDeleteModal: false, itemToDelete: {} });
  }

  onSaveClick(data) {
    data.productId = parseInt(this.state.productId);

    if (this.state.editMode) {
      this.props.dispatch(
        productReleaseActions.editProductRelease(data, this.state.productId)
      );
    } else {
      this.props.dispatch(
        productReleaseActions.createProductRelease(data, this.state.productId)
      );
    }

    this.setState({
      showInsertUpdateForm: false,
      editItem: {},
      editMode: false
    });
  }

  onLockVersion(data) {
    if (data.locked) {
      this.props.dispatch(
        productReleaseActions.unlockProductRelease(data.ID, data.productId)
      );
    } else {
      this.props.dispatch(
        productReleaseActions.lockProductRelease(data.ID, data.productId)
      );
    }
  }

  getRowClassName(item) {
    if (item.locked) {
      return 'bg-disabled';
    }
    return '';
  }

  onClickNew() {
    this.setState({ showInsertUpdateForm: true });
  }

  render() {
    const items = this.props.productReleases
      .filter(
        d =>
          this.state.inputFilter === '' ||
          d.chartName.includes(this.state.inputFilter)
      )
      .sort((a, b) => utils.sortNumber(a.ID, b.ID))
      .map((item, key) => (
        <tr key={key} className={this.getRowClassName(item)}>
          <td>{item.ID}</td>
          <td>{item.date}</td>
          <td>{item.version}</td>
          <td>
            <Button
              variant="danger"
              className="link-button"
              onClick={() =>
                this.setState({ itemToDelete: item }, () => {
                  this.setState({ showConfirmDeleteModal: true });
                })
              }
            >
              <i className="pe-7s-trash" />
            </Button>
          </td>
          <td>
            <Button
              className="link-button"
              onClick={() =>
                this.props.history.push({
                  pathname: '/admin/product-version-service',
                  search: '?productVersionId=' + item.ID
                })
              }
              disabled={
                !this.props.keycloak.hasRealmRole('tenkai-lock-version')
              }
            >
              <i className="pe-7s-news-paper" />
            </Button>
          </td>
          <td>
            <Button
              className="link-button"
              variant={item.locked ? 'primary' : 'danger'}
              onClick={this.onLockVersion.bind(this, item)}
            >
              <i className={item.locked ? 'pe-7s-lock' : 'pe-7s-unlock'} />
              {item.locked ? 'Unlock' : 'Lock'}
            </Button>
          </td>
        </tr>
      ));

    return (
      <div className="content">
        <SimpleModal
          showConfirmDeleteModal={this.state.showConfirmDeleteModal}
          handleConfirmDeleteModalClose={() =>
            this.setState({ showConfirmDeleteModal: false, itemToDelete: {} })
          }
          title="Confirm"
          subTitle="Delete release"
          message="Are you sure you want to delete this release?"
          handleConfirmDelete={this.handleConfirmDelete.bind(this)}
        ></SimpleModal>

        <Container fluid>
          <Row>
            <Col md={12}>
              <CardButton
                buttonName="New Release"
                handleClick={this.onClickNew.bind(this)}
              />
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              {this.state.showInsertUpdateForm ? (
                <EditProductRelease
                  editMode={this.state.editMode}
                  handleLoading={this.props.handleLoading}
                  editItem={this.state.editItem}
                  saveClick={this.onSaveClick.bind(this)}
                  cancelClick={() =>
                    this.setState({
                      showInsertUpdateForm: false,
                      editItem: {},
                      editMode: false
                    })
                  }
                />
              ) : null}
            </Col>
          </Row>

          <Row>
            <Col md={12}>
              <CardTenkai
                title="Releases"
                content={
                  <form>
                    <div>
                      <div className="col-md-8">
                        <FormGroup>
                          <FormLabel>Release Search</FormLabel>
                          <FormControl
                            value={this.state.inputFilter}
                            onChange={e =>
                              this.setState({ inputFilter: e.target.value })
                            }
                            style={{ width: '100%' }}
                            type="text"
                            placeholder="Search using any field"
                            aria-label="Search using any field"
                          ></FormControl>
                        </FormGroup>
                      </div>

                      <div>
                        <Table bordered condensed size="sm">
                          <thead>
                            <tr>
                              <th>#</th>
                              <th>Date</th>
                              <th>Version</th>
                              <th>Delete</th>
                              <th>Services</th>
                              <th>Lock Version</th>
                            </tr>
                          </thead>
                          <tbody>{items}</tbody>
                        </Table>
                      </div>
                    </div>
                  </form>
                }
              />
            </Col>
          </Row>
        </Container>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  loading: productReleaseSelectors.getLoading(state),
  productReleases: productReleaseSelectors.getProductReleases(state),
  error: productReleaseSelectors.getError(state)
});

export default connect(mapStateToProps)(ProductRelease);
