import React, { Component } from "react";
import { Card } from "components/Card/Card.jsx";
import { FormGroup, ControlLabel, Button } from "react-bootstrap";
import Select from "react-select";
import { retriveRepo, retrieveCharts, getTagsOfImage, getDockerImageFromHelmChart } from "client-api/apicall.jsx";

export class ProductReleaseServiceForm extends Component {
  state = {
    formData: {
      productVersionId: "",
      serviceName: "",
      dockerImageTag: ""
    },
    charts: [],
    repositories: [],
    selectedRepository: {},
    selectedChart: {}
  };

  componentDidMount() {
    if (this.props.editItem) {
      this.setState(() => ({
        formData: this.props.editItem
      }));
    } else {
      this.setState(() => ({
        formData: {}
      }));
    }
    retriveRepo(this);
  }

  handleChange = event => {
    const { value, name } = event.target;
    this.setState(state => ({
      formData: {
        ...state.formData,
        [name]: value
      }
    }));
  };

  saveClick = event => {
    event.preventDefault();
    const data = this.state.formData;
    data.serviceName = this.state.selectedChart.value;
    this.props.saveClick(data);
  };

  handleRepositoryChange = selectedRepository => {
    this.setState({ selectedRepository });
    retrieveCharts(selectedRepository.value, this);
  };

  async retrieveTagsOfImage(imageName) {
    getTagsOfImage(this, imageName, (self, data) => {
      var arr = [];
      if (data.tags != null) {
        for (var x = 0; x < data.tags.length; x++) {
          var element = data.tags[x];
          arr.push({ value: element.tag, label: element.tag });
        }
      }
      this.setState({ tags: arr });
    });
  }

  handleChartChange = selectedChart => {
    this.setState({ selectedChart });

    let payload = {
      chartName: selectedChart.value,
      chartVersion: ""
    };
    getDockerImageFromHelmChart(this, payload, (self, dockerImage) => {
      if(dockerImage) {
        this.retrieveTagsOfImage(dockerImage);
      }
    });
  };

  handleContainerTagChange = selectedTag => {
    this.setState(state => ({
      formData: {
        ...state.formData,
        dockerImageTag: selectedTag.value
      }
    }));
  };

  render() {
    const { editMode } = this.props;
    const { selectedChart } = this.state;
    const { selectedRepository } = this.state;

    return (
      <div>
        <Card
          title={editMode ? "Edit Chart Association" : "New Chart Association"}
          content={
            <form>
              <FormGroup>
                <ControlLabel>Repository</ControlLabel>
                <Select
                  value={selectedRepository}
                  onChange={this.handleRepositoryChange}
                  options={this.state.repositories}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Helm Chart</ControlLabel>
                <Select
                  value={selectedChart}
                  onChange={this.handleChartChange}
                  options={this.state.charts}
                />
              </FormGroup>

              <FormGroup>
                <ControlLabel>Docker Image Tag</ControlLabel>
                <Select
                  value={this.state.selectedTag}
                  onChange={this.handleContainerTagChange}
                  options={this.state.tags}
                />
              </FormGroup>

              <div className="btn-toolbar">
                <div className="btn-group">
                  <Button bsStyle="info" type="button" onClick={this.saveClick}>
                    Save
                  </Button>
                </div>
                <div className="btn-group">
                  <Button
                    bsStyle="info"
                    type="button"
                    onClick={this.props.cancelClick}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
              <div className="clearfix" />
            </form>
          }
        />
      </div>
    );
  }
}

export default ProductReleaseServiceForm;