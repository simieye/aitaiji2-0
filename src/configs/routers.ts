import INDEX from '../pages/index.jsx';
import PRODUCT from '../pages/product.jsx';
import SOLUTIONS from '../pages/solutions.jsx';
import BLOG from '../pages/blog.jsx';
import RESOURCES from '../pages/resources.jsx';
import ABOUT from '../pages/about.jsx';
import CHAT from '../pages/chat.jsx';
import SUBSCRIPTION from '../pages/subscription.jsx';
import EXPERIMENTS from '../pages/experiments.jsx';
import DASHBOARD from '../pages/dashboard.jsx';
import ROLES from '../pages/roles.jsx';
import EXPORT from '../pages/export.jsx';
import I18N from '../pages/i18n.jsx';
export const routers = [{
  id: "index",
  component: INDEX
}, {
  id: "product",
  component: PRODUCT
}, {
  id: "solutions",
  component: SOLUTIONS
}, {
  id: "blog",
  component: BLOG
}, {
  id: "resources",
  component: RESOURCES
}, {
  id: "about",
  component: ABOUT
}, {
  id: "chat",
  component: CHAT
}, {
  id: "subscription",
  component: SUBSCRIPTION
}, {
  id: "experiments",
  component: EXPERIMENTS
}, {
  id: "dashboard",
  component: DASHBOARD
}, {
  id: "roles",
  component: ROLES
}, {
  id: "export",
  component: EXPORT
}, {
  id: "i18n",
  component: I18N
}]