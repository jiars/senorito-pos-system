import { Fragment } from "react";
import { Link, useLocation } from "react-router-dom";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "../ui/breadcrumb";

import { APP_ROUTE_METADATA } from "../../routes/routeMetadata";

const Breadcrumbs = () => {
  const location = useLocation();

  const currentRoute = APP_ROUTE_METADATA.find((item) => {
    return item.path === location.pathname;
  });

  if (currentRoute === undefined || currentRoute.path === "/pos") {
    return null;
  }

  const breadcrumbRoutes = [];
  let routeToAdd = currentRoute;

  while (routeToAdd !== undefined) {
    breadcrumbRoutes.unshift(routeToAdd);

    if (routeToAdd.parentPath === undefined) {
      break;
    }

    routeToAdd = APP_ROUTE_METADATA.find((item) => {
      return item.path === routeToAdd.parentPath;
    });
  }

  return (
    <Breadcrumb className="mb-[var(--app-gap-section)]">
      <BreadcrumbList className="text-sm text-[var(--app-color-text-subtle)]">
        <BreadcrumbItem>
          <BreadcrumbLink
            render={<Link to="/dashboard" />}
            className="text-[var(--app-color-text-subtle)] no-underline hover:text-[var(--app-color-brand)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]"
          >
            Señorito Café
          </BreadcrumbLink>
        </BreadcrumbItem>

        {breadcrumbRoutes.map((route, index) => {
          const isCurrentRoute = index === breadcrumbRoutes.length - 1;

          return (
            <Fragment key={route.path}>
              <BreadcrumbSeparator className="text-[var(--app-color-text-subtle)]">
                <i className="bi bi-chevron-right text-sm leading-none"></i>
              </BreadcrumbSeparator>

              <BreadcrumbItem>
                {isCurrentRoute ? (
                  <BreadcrumbPage className="font-bold text-[var(--app-color-text)]">
                    {route.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink
                    render={<Link to={route.path} />}
                    className="text-[var(--app-color-text-subtle)] no-underline hover:text-[var(--app-color-brand)] focus-visible:rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--app-color-brand)]"
                  >
                    {route.label}
                  </BreadcrumbLink>
                )}
              </BreadcrumbItem>
            </Fragment>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
};

export default Breadcrumbs;
